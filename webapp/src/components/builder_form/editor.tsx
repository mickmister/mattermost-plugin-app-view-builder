import React from 'react';

export type EditorState = {
    contentSource: string;
    content: string;
    language: string;
}

export type EditorProps = EditorState & {
    save: (content: string) => void;
    cancel?: () => void;
    onEditorDidMount: (editor: any, monaco: any) => void;
    onTextChange: (content: string) => void;
    showFullScreenButton: boolean;
    path?: string;
    editorHeight?: string;
    cancel: () => void;
    confirmText?: string;
}

type Props = {
    value: string;
    path: string;
    onEditorDidMount: (editor: any, monaco: any) => void;
    onTextChange: (content: string) => void;
    save: () => void;
}

export default function Editor(props: Props) {
    const [contentSource, setContentSource] = React.useState(props.value);

    if (!window.MonacoEditor) {
        return (
            <textarea
                style={{resize: 'vertical'}}
                className='form-control'
                rows={20}
                value={props.value}
                onChange={(e) => props.onTextChange(e.target.value)}
            />
        )
    }

    const editorProps: EditorProps = {
        path: props.path,
        content: props.value,
        contentSource: contentSource,
        language: 'json',
        onTextChange: props.onTextChange,
        onEditorDidMount: props.onEditorDidMount,
        save: props.save,
        showFullScreenButton: false,
        editorHeight: '700px',
        confirmText: 'Run',
    };

    const MonacoEditor = window.MonacoEditor;
    const editor = <MonacoEditor {...editorProps}/>

    return (
        <div>
            {editor}
        </div>
    );
}
