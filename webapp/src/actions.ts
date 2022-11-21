import {PostTypes} from 'mattermost-redux/action_types';

import {Client4} from 'mattermost-redux/client';
import {Post} from 'mattermost-redux/types/posts';

export function sendEphemeralPost(message: string, channelId: string, postType?: string) {
    return (dispatch, getState) => {
        const timestamp = Date.now();
        const post = {
            channel_id: channelId,
            message,
            type: postType || 'system_ephemeral',
        } as Post;

        Client4.createPost(post);

        // dispatch({
        //     type: PostTypes.RECEIVED_NEW_POST,
        //     data: post,
        //     channelId,
        // });
    };
}
