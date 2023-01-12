import {Store, Action} from 'redux';

import {GlobalState} from 'mattermost-redux/types/store';

import manifest from './manifest';

// eslint-disable-next-line import/no-unresolved
import {PluginRegistry} from './types/mattermost-webapp';

import CustomPost from 'components/custom_post/custom_post';
import {sendEphemeralPost} from 'actions';

type ContextArgs = {channel_id: string};

export default class Plugin {
    store: Store<GlobalState, Action<Record<string, unknown>>>;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
    public async initialize(registry: PluginRegistry, store: Store<GlobalState, Action<Record<string, unknown>>>) {
        // @see https://developers.mattermost.com/extend/plugins/webapp/reference/

        this.store = store;

        // registry.registerRootComponent(DataInputModal);
        registry.registerPostTypeComponent('custom_builder', CustomPost);

        registry.registerSlashCommandWillBePostedHook((rawMessage: string, contextArgs: ContextArgs) => {
            let message;
            if (rawMessage) {
                message = rawMessage.trim();
            }

            if (!message) {
                return Promise.resolve({message, args: contextArgs});
            }

            if (!message.startsWith('/builder')) {
                return Promise.resolve({message, args: contextArgs});
            }

            this.createCustomPost(contextArgs.channel_id);
            return Promise.resolve({});
        });
    }

    createCustomPost = (channelID: string) => {
        this.store.dispatch(sendEphemeralPost('', channelID, 'custom_builder'));
    }
}

declare global {
    interface Window {
        registerPlugin(id: string, plugin: Plugin): void
    }
}

window.registerPlugin(manifest.id, new Plugin());
