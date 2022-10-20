import {AppForm} from '@mattermost/types/lib/apps';

export const zoom = {
    backend: {
        "manifest": {
            "app_id": "app-view-builder",
            "deploy": {
                "http": {
                    "root_url": "http://localhost:8065/plugins/app-view-builder/app"
                },
            },
            "icon": "icon.png",
            "homepage_url": "https://github.com/mattermost/mattermost-plugin-apps/examples/go/goapp",
            "display_name": "That display name"
        },
        "bindings": [
            {
                "location": "/command",
                "bindings": [
                    {
                        "location": "test",
                        "description": "test command",
                        "submit": {
                            "path": "/test/submit",
                            "expand": {
                                "acting_user": "all",
                                "channel": "all"
                            }
                        }
                    }
                ]
            }
        ],
        "calls": {
            "/test/submit": {
                "text": "Yes"
            },
            "/super_actions/start_meeting": {
                "text": "Starting meeting"
            }
        }
    },
    frontend: {
        "app_id": "app-view-builder-app",
        "label": "Zoom",
        "type": "view",
        "bindings": [
            {
                "type": "view",
                "bindings": [
                    {
                        "type": "markdown",
                        "label": "### Your Personal Meeting ID\n#### 440 287 4306\nhttps://mattermost.zoom.us/my/some.user"
                    },
                    {
                        "type": "button",
                        "label": "Start a Meeting",
                        "icon": "icons/zoom-icon-small.png",
                        "submit": {
                            "path": "/super_actions/start_meeting",
                            "state": {
                                "meeting_id": "4402874306"
                            }
                        }
                    }
                ]
            },
            {
                "type": "divider"
            },
            {
                "type": "markdown",
                "label": "## Upcoming Zoom Meetings"
            },
            {
                "type": "view",
                "bindings": [
                    {
                        "type": "markdown",
                        "label": "#### Customer Obsession Meeting\n\n11:00AM - 12:00PM\n\nHappening right now"
                    },
                    {
                        "type": "button",
                        "label": "Join Meeting",
                        "submit": {
                            "path": "/actions/join_meeting",
                            "state": {
                                "meeting_id": "22222"
                            }
                        }
                    }
                ]
            },
            {
                "type": "divider"
            },
            {
                "type": "view",
                "bindings": [
                    {
                        "type": "markdown",
                        "label": "#### Design Crit\n\n2:00PM - 3:00PM"
                    },
                    {
                        "type": "button",
                        "label": "Join Meeting",
                        "submit": {
                            "path": "/actions/join_meeting",
                            "state": {
                                "meeting_id": "33333"
                            }
                        }
                    }
                ]
            }
        ]
    },
};

export const github = {
    backend: {},
    frontend: {
        type: 'view',
        app_id: 'app-view-builder-app',
        label: 'GitHub',
        description: 'The Description',
        bindings: [
            {
                type: 'menu',
                // label: 'Menu Title',
                bindings: [
                    {
                        type: 'menu_item',
                        label: 'Your Pull Requests',
                        hint: '5',
                        icon: 'icon-github-circle',
                        submit: {
                            path: '/views/my-pull-requests',
                        },
                    },
                    {
                        "type": "menu_item",
                        "label": "Pull Requests Needing Review",
                        "hint": "8",
                        "icon": "icon-github-circle",
                        submit: {
                            path: '/views/review-requested',
                        },
                    },
                    {
                        "type": "menu_item",
                        "label": "Assignments",
                        "hint": "5",
                        "icon": "icon-github-circle",
                        submit: {
                            path: '/views/assignments',
                        },
                    },
                    {
                        "type": "menu_item",
                        "label": "Unread Messages",
                        "hint": "10",
                        "icon": "icon-github-circle",
                        submit: {
                            path: '/views/unread-messages',
                        },
                    },
                ],
            },
        ],
    },
};

const docsListItem = {
    "label": "App Bar User Interactions",
    "description": "4:30 PM · Opened by me",
    "icon": "https://imgs.search.brave.com/kqSpoYPsNG6ZF3Sdk5LbAFl6u2YHiZMKPwKWBgolodQ/rs:fit:512:512:1/g:ce/aHR0cDovL2ljb25z/Lmljb25hcmNoaXZl/LmNvbS9pY29ucy9w/YXBpcnVzLXRlYW0v/cGFwaXJ1cy1hcHBz/LzUxMi9nb29nbGUt/ZG9jcy1pY29uLnBu/Zw",
    "submit": {
        "path": "/actions/open-file",
        "state": {
            "file-id": "some-id-11111"
        }
    },
    "bindings": [
        // {
        //     "type": "view",
        //     "bindings": [{
        //         "type": "markdown",
        //         "label": "Other text"
        //     }]
        // },
        {
            "type": "actions",
            "bindings": [
                {
                    "label": "Open",
                    "submit": {
                        "path": "/actions/open-file",
                        "state": {
                            "file-id": "some-id-11111"
                        }
                    }
                },
                {
                    "label": "Share",
                    "submit": {
                        "path": "/actions/share-file",
                        "state": {
                            "file-id": "some-id-11111"
                        }
                    }
                },
                {
                    "label": "Delete",
                    form: {
                        title: 'Confirm File Delete',
                        submit: {
                            "path": "/actions/delete-file",
                            "state": {
                                "file-id": "some-id-11111"
                            },
                        },
                        fields: [
                            {
                                name: 'markdown',
                                type: 'markdown',
                                description: 'File 123',
                            },
                            {
                                name: 'submit_buttons',
                                type: 'static_select',
                                options: [
                                    {
                                        label: 'Confirm',
                                        value: 'confirm',
                                    },
                                ]
                            }
                        ],
                        submit_buttons: 'submit_buttons',
                    } as AppForm,
                }
            ]
        }
    ]
};

const docsView = {
    "app_id": "app-view-builder-app",
    "label": "Docs",
    "type": "view",
    "bindings": [
        {
            "type": "view",
            "bindings": [
                {
                    "type": "list_block",
                    "label": "My Drive",
                    "bindings": [
                        docsListItem,
                        {...docsListItem, label: docsListItem.label + ' 2'},
                    ]
                }
            ]
        }
    ]
};

export const docs = {
    frontend: docsView,
    backend: {
        "calls": {
            "/actions/open-file": {
                "type": "navigate",
                "navigate_to_url": "https://drive.google.com/file/d/1vujhOtERpFhSv9YgMXgUgGxHm67lbGE_/view?usp=sharing"
            },
            "/actions/share-file": {
                "type": "ok",
                "text": "URL to share: https://drive.google.com/file/d/1vujhOtERpFhSv9YgMXgUgGxHm67lbGE_/view?usp=sharing"
            },
            "/actions/delete-file": {
                "type": "ok",
                "text": "Deleted file",
            },
            "/views/home": {
                "data": docsView,
            },
        },
        "bindings": [
            {
                "location": "/channel_header",
                "bindings": [
                    {
                        "location": "test",
                        "label": "Google Drive",
                        "description": "test command",
                        "icon": "https://imgs.search.brave.com/Ag7fXBLnY7FpZznBJ78SDwCoPDgbJBm2R0Y1WcFnVP4/rs:fit:1200:1200:1/g:ce/aHR0cHM6Ly9waXhs/b2suY29tL3dwLWNv/bnRlbnQvdXBsb2Fk/cy8yMDIxLzA0L0dv/b2dsZV9Ecml2ZV9p/Y29uLmpwZw",
                        "submit": {
                            "path": "/views/home",
                            "expand": {
                                "acting_user": "all",
                                "channel": "all"
                            }
                        }
                    }
                ]
            }
        ],
    },
};
