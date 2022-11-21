package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"sync"

	pluginapi "github.com/mattermost/mattermost-plugin-api"
	"github.com/mattermost/mattermost-plugin-apps/utils/httputils"
	"github.com/mattermost/mattermost-server/v6/plugin"

	"github.com/mattermost/mattermost-plugin-app-view-builder/server/app"
)

// Plugin implements the interface expected by the Mattermost server to communicate between the server and plugin processes.
type Plugin struct {
	plugin.MattermostPlugin

	// configurationLock synchronizes access to the configuration.
	configurationLock sync.RWMutex

	// configuration is the active plugin configuration. Consult getConfiguration and
	// setConfiguration for usage.
	configuration *configuration

	client *pluginapi.Client

	App *app.App
}

func (p *Plugin) OnActivate() error {
	p.client = pluginapi.NewClient(p.API, p.Driver)

	p.App = app.Init(p.client, nil)

	p.InstallMonacoPlugin()

	return nil
}

func (p *Plugin) InstallMonacoPlugin() {
	monacoPluginID := "monaco-editor"
	releaseURL := "https://github.com/mickmister/mattermost-plugin-monaco/releases/v1.0.0/something.tar.gz"
	if p.client.Configuration.GetConfig().PluginSettings.PluginStates[monacoPluginID] == nil {
		p.client.Plugin.InstallPluginFromURL(releaseURL, true)
		p.client.Plugin.Enable(monacoPluginID)
	}
}

// ServeHTTP demonstrates a plugin that handles HTTP requests by greeting the world.
func (p *Plugin) ServeHTTP(c *plugin.Context, w http.ResponseWriter, r *http.Request) {
	switch {
	case r.URL.Path == "/prime_http":
		p.handlePrimeHTTP(w, r)
		return
	case r.URL.Path == "/templates":
		p.handleGetTemplates(w, r)
		return

	case strings.HasPrefix(r.URL.Path, "/app"):
		r.URL.Path = r.URL.Path[4:]
		p.App.ServeHTTP(w, r)
		return
	}

	fmt.Fprint(w, "Hello, world!")
}

func (p *Plugin) handlePrimeHTTP(w http.ResponseWriter, r *http.Request) {
	payload := app.Template{}
	err := json.NewDecoder(r.Body).Decode(&payload)
	r.Body.Close()

	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	err = p.saveTemplate(payload)
	if err != nil {
		p.client.Log.Error(err.Error())
	}

	p.App = app.Init(p.client, &payload)
}

func (p *Plugin) handleGetTemplates(w http.ResponseWriter, r *http.Request) {
	templates := []app.Template{}
	err := p.client.KV.Get("saved_templates", &templates)
	if err != nil {
		httputils.WriteError(w, err)
		return
	}

	httputils.WriteJSON(w, templates)
}

func (p *Plugin) saveTemplate(t app.Template) error {
	templates := []app.Template{}
	err := p.client.KV.Get("saved_templates", &templates)
	if err != nil {
		return err
	}

	templates = append(templates, t)
	_, err = p.client.KV.Set("saved_templates", templates)
	if err != nil {
		return err
	}

	return nil
}
