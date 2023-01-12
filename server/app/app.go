package app

import (
	"embed"
	"net/http"

	pluginapi "github.com/mattermost/mattermost-plugin-api"
	"github.com/mattermost/mattermost-plugin-apps/apps"
	"github.com/mattermost/mattermost-plugin-apps/apps/goapp"
	"github.com/mattermost/mattermost-plugin-apps/utils"
	"github.com/mattermost/mattermost-plugin-apps/utils/httputils"
	"github.com/pkg/errors"
)

type Template struct {
	Frontend interface{} `json:"frontend"`
	Backend  struct {
		Bindings []apps.Binding               `json:"bindings"`
		Manifest *apps.Manifest               `json:"manifest"`
		Calls    map[string]apps.CallResponse `json:"calls"`
	} `json:"backend"`
}

// static is preloaded with the contents of the ./static directory.
//
//go:embed static
var static embed.FS

const (
	appID          = "app-view-builder-app"
	appDisplayName = "App View Builder"
)

const rootURLSuffix = "/plugins/app-view-builder/app"

var defaultManifest = apps.Manifest{
	AppID:       appID,
	DisplayName: appDisplayName,
	RequestedLocations: apps.Locations{
		apps.LocationChannelHeader,
		apps.LocationCommand,
	},
	Icon:        "icon.png",
	HomepageURL: "https://github.com/mattermost/mattermost-plugin-apps/examples/go/goapp",
}

type App struct {
	currentTemplate *Template

	Goapp *goapp.App
}

func (a *App) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path == "/bindings" {
		a.handleGetBindings(w, r)
		return
	}

	a.Goapp.Router.ServeHTTP(w, r)
}

func Init(client *pluginapi.Client, template *Template) *App {
	manifest := defaultManifest
	if template != nil && template.Backend.Manifest != nil {
		manifest = *template.Backend.Manifest
	}

	siteURL := *client.Configuration.GetConfig().ServiceSettings.SiteURL
	rootURL := siteURL + rootURLSuffix

	manifest.Deploy = apps.Deploy{
		HTTP: &apps.HTTP{
			RootURL: rootURL,
		},
	}

	gop := goapp.MakeAppOrPanic(
		manifest,
		goapp.WithStatic(static),
		goapp.WithCommand(send),
		// goapp.WithChannelHeader(send),
		goapp.WithLog(utils.NewPluginLogger(client)),
		// goapp.With
	)

	if template != nil {
		for p, resp := range template.Backend.Calls {
			func(p string, resp apps.CallResponse) {
				gop.HandleCall(p, func(cr goapp.CallRequest) apps.CallResponse {
					return resp
				})
			}(p, resp)
		}
	}

	registerOldGoappRoutes(gop)

	gop.HandleCall("/views/home/refresh/document-list", func(cr goapp.CallRequest) apps.CallResponse {
		type state struct {
			DriveID string `json:"drive_id"`
		}

		binding, err := makeDocumentListBlock(cr)
		if err != nil {
			return apps.NewErrorResponse(errors.Wrap(err, "failed to create document list"))
		}

		return apps.CallResponse{
			Type: "view",
			Data: binding,
		}
	})

	return &App{
		Goapp:           gop,
		currentTemplate: template,
	}
}

func (a *App) handleGetBindings(w http.ResponseWriter, r *http.Request) {
	if a.currentTemplate == nil {
		httputils.WriteJSON(w, []*apps.Binding{})
		return
	}

	resp := apps.NewDataResponse(a.currentTemplate.Backend.Bindings)
	httputils.WriteJSON(w, resp)
}

func registerOldGoappRoutes(gop *goapp.App) {
	gop.HandleCall("/actions/start_meeting", func(cr goapp.CallRequest) apps.CallResponse {
		return apps.CallResponse{
			Type:          apps.CallResponseTypeNavigate,
			NavigateToURL: "https://github.com",
		}
	})

	gop.HandleCall("/views/my-pull-requests", func(cr goapp.CallRequest) apps.CallResponse {
		return apps.CallResponse{
			Type:          apps.CallResponseTypeNavigate,
			NavigateToURL: "https://github.com/pulls",
		}
	})

	gop.HandleCall("/views/review-requested", func(cr goapp.CallRequest) apps.CallResponse {
		return apps.CallResponse{
			Type:          apps.CallResponseTypeNavigate,
			NavigateToURL: "https://github.com/pulls/review-requested",
		}
	})

	gop.HandleCall("/views/assignments", func(cr goapp.CallRequest) apps.CallResponse {
		return apps.CallResponse{
			Type:          apps.CallResponseTypeNavigate,
			NavigateToURL: "https://github.com/issues?q=is%3Aopen++assignee%3A@me+archived%3Afalse+",
		}
	})

	gop.HandleCall("/views/unread-messages", func(cr goapp.CallRequest) apps.CallResponse {
		return apps.CallResponse{
			Type:          apps.CallResponseTypeNavigate,
			NavigateToURL: "https://github.com/notifications",
		}
	})
}

// send is the bindable (form) action that implements the /hello-goapp send
// command.
var send = goapp.MakeBindableFormOrPanic("send",
	apps.Form{
		Title:  "Hello, world!",
		Icon:   "icon.png",
		Fields: []apps.Field{{Name: "message"}},
		Submit: &apps.Call{
			Expand: &apps.Expand{
				ActingUser: apps.ExpandID,
			},
		},
	},
	func(creq goapp.CallRequest) apps.CallResponse {
		message := "Hello from a goapp."
		custom := creq.GetValue("message", "")
		if custom != "" {
			message += " ...and " + custom + "!"
		}

		creq.AsBot().DM(creq.Context.ActingUser.Id, message)
		return apps.NewTextResponse("Created a post in your DM channel. Message: `%s`.", message)
	},
)
