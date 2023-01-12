package app

import (
	"encoding/json"

	"github.com/mattermost/mattermost-plugin-apps/apps"
	"github.com/mattermost/mattermost-plugin-apps/apps/goapp"
)

type Document struct {
	ID    string `json:"id"`
	Label string `json:"label"`
}

type driveSelectionState struct {
	DriveID string `json:"drive_id"`
}

type documentSelectionState struct {
	DocumentID string `json:"document_id"`
}

func makeDocumentItem(document Document) apps.Binding {
	return apps.Binding{
		Location:    apps.Location(document.ID),
		Label:       document.Label,
		Description: "4:30 PM · Opened by me",
		Icon:        "https://imgs.search.brave.com/kqSpoYPsNG6ZF3Sdk5LbAFl6u2YHiZMKPwKWBgolodQ/rs:fit:512:512:1/g:ce/aHR0cDovL2ljb25z/Lmljb25hcmNoaXZl/LmNvbS9pY29ucy9w/YXBpcnVzLXRlYW0v/cGFwaXJ1cy1hcHBz/LzUxMi9nb29nbGUt/ZG9jcy1pY29uLnBu/Zw",
		Submit: &apps.Call{
			Path: "/actions/open-file",
			State: documentSelectionState{
				DocumentID: document.ID,
			},
		},
		Bindings: []apps.Binding{
			{
				Type: "actions",
				Bindings: []apps.Binding{
					{
						Label: "Open",
						Icon:  "https://imgs.search.brave.com/kqSpoYPsNG6ZF3Sdk5LbAFl6u2YHiZMKPwKWBgolodQ/rs:fit:512:512:1/g:ce/aHR0cDovL2ljb25z/Lmljb25hcmNoaXZl/LmNvbS9pY29ucy9w/YXBpcnVzLXRlYW0v/cGFwaXJ1cy1hcHBz/LzUxMi9nb29nbGUt/ZG9jcy1pY29uLnBu/Zw",
						Submit: &apps.Call{
							Path: "/actions/open-file",
							State: documentSelectionState{
								DocumentID: document.ID,
							},
						},
					},
					{
						Label: "Share",
						Icon:  "https://imgs.search.brave.com/kqSpoYPsNG6ZF3Sdk5LbAFl6u2YHiZMKPwKWBgolodQ/rs:fit:512:512:1/g:ce/aHR0cDovL2ljb25z/Lmljb25hcmNoaXZl/LmNvbS9pY29ucy9w/YXBpcnVzLXRlYW0v/cGFwaXJ1cy1hcHBz/LzUxMi9nb29nbGUt/ZG9jcy1pY29uLnBu/Zw",
						Submit: &apps.Call{
							Path: "/actions/share-file",
							State: documentSelectionState{
								DocumentID: document.ID,
							},
						},
					},
					{
						Label: "Delete",
						Icon:  "https://imgs.search.brave.com/kqSpoYPsNG6ZF3Sdk5LbAFl6u2YHiZMKPwKWBgolodQ/rs:fit:512:512:1/g:ce/aHR0cDovL2ljb25z/Lmljb25hcmNoaXZl/LmNvbS9pY29ucy9w/YXBpcnVzLXRlYW0v/cGFwaXJ1cy1hcHBz/LzUxMi9nb29nbGUt/ZG9jcy1pY29uLnBu/Zw",
						Form: &apps.Form{
							Title: "Confirm File Delete",
							Submit: &apps.Call{
								Path: "/actions/delete-file",
								State: documentSelectionState{
									DocumentID: document.ID,
								},
							},
							Fields: []apps.Field{
								{
									Name:        "markdown",
									Type:        "markdown",
									Description: "File " + document.Label,
								},
								{
									Name: "submit_buttons",
									Type: "static_select",
									SelectStaticOptions: []apps.SelectOption{
										{
											Label: "Confirm",
											Value: "confirm",
										},
									},
								},
							},
							SubmitButtons: "submit_buttons",
						},
					},
				},
			},
		},
	}
}

func makeDocumentListBlock(cr goapp.CallRequest) (*apps.Binding, error) {
	state := driveSelectionState{}

	inState := cr.State
	b, err := json.Marshal(inState)
	if err != nil {
		return nil, err
	}

	err = json.Unmarshal(b, &state)
	if err != nil {
		return nil, err
	}

	driveID := state.DriveID
	documents := []Document{}

	channelName := "No channel provided"
	if cr.Context.Channel != nil {
		channelName = cr.Context.Channel.DisplayName
	}

	switch driveID {
	case "my_drive":
		documents = []Document{
			{
				ID:    "my_doc_1",
				Label: "My Document - " + channelName,
			},
			{
				ID:    "my_doc_2",
				Label: "My Second Document",
			},
		}
	case "shared_with_me":
		documents = []Document{
			{
				ID:    "shared_doc_1",
				Label: "My Shared Document - " + channelName,
			},
			{
				ID:    "shared_doc_2",
				Label: "My Second Shared Document",
			},
		}
	default:
		documents = []Document{{
			ID:    "error",
			Label: "Can't find drive: " + driveID,
		}}
	}

	listItems := []apps.Binding{}

	for _, doc := range documents {
		listItems = append(listItems, makeDocumentItem(doc))
	}

	return &apps.Binding{
		Type:     "view",
		Location: "document-list",
		Source: &apps.Call{
			Path: "/views/home/refresh/document-list",
			State: driveSelectionState{
				DriveID: driveID,
			},
			Expand: &apps.Expand{
				Channel: apps.ExpandSummary,
			},
		},
		Bindings: []apps.Binding{{
			Type:     "list_block",
			Bindings: listItems,
		}},
	}, nil
}
