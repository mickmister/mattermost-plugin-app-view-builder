import React, {useEffect, useRef, useState} from 'react';
import {Modal} from 'react-bootstrap';
import {useDispatch, useSelector} from 'react-redux';

import {getTheme} from 'mattermost-redux/selectors/entities/preferences';

import {getModalStyles} from 'utils/styles';

import {EditorPath, useMonaco} from 'hooks/use_monaco';

import {id} from 'manifest';

import {github, zoom, docs} from './initial_data';
import Editor from './editor';

enum EditorTabs {
    frontend = 'frontend',
    backend = 'backend',
}

const initialSelectedTemplate = docs;

const initialFrontendStr = JSON.stringify(initialSelectedTemplate.frontend, null, 2);
const initialBackendStr = JSON.stringify(initialSelectedTemplate.backend, null, 2);

export default function BuilderForm() {
    const theme = useSelector(getTheme);

    const [name, setName] = useState('');

    const [frontendText, setFrontendText] = useState(initialFrontendStr);
    const [backendText, setBackendText] = useState(initialBackendStr);
    const frontendTextRef = useRef(frontendText);
    const backendTextRef = useRef(backendText);

    const [currentTab, setCurrentTab] = useState<EditorTabs>(EditorTabs.frontend);

    const [selectedTemplate, setSelectedTemplate] = useState(initialSelectedTemplate.frontend.label);
    const [error, setError] = useState('');

    const dispatch = useDispatch();

    useEffect(() => {
        frontendTextRef.current = frontendText;
        backendTextRef.current = backendText;
    }, []);

    useEffect(() => {
        const template = [docs, github, zoom].find(t => t.frontend.label === selectedTemplate)
        if (!template) {
            return;
        }

        const front = JSON.stringify(template.frontend, null, 2)
        setFrontendText(front);
        frontendTextRef.current = front;

        const back = JSON.stringify(template.backend, null, 2)
        setBackendText(back);
        backendTextRef.current = back;
    }, [selectedTemplate]);

    const onEditorDidMount = useMonaco();

    const onTextChange = (text: string) => {
        if (currentTab === EditorTabs.frontend) {
            setFrontendText(text);
            frontendTextRef.current = text
        } else {
            setBackendText(text);
            backendTextRef.current = text
        }
    }

    const handleSave = () => {
        // dispatch(closeModal());
    };

    const handleRun = React.useCallback(async (e?: any) => {
        e?.preventDefault?.();

        try {
            const payload = {
                frontend: JSON.parse(frontendTextRef.current),
                backend: JSON.parse(backendTextRef.current),
            };

            await fetch('/plugins/' + id + '/prime_http', {
                method: 'POST',
                body: JSON.stringify(payload),
            });

            const data = JSON.parse(frontendTextRef.current);
            dispatch(window.showRHSAppBinding(data));
        } catch (e) {
            alert(e);
        }
    }, [frontendTextRef, backendTextRef]);

    const style = getModalStyles(theme);
    const disableSubmit = frontendText.length === 0;

    const buttons = (
        <React.Fragment>
            <button
                type='button'
                className='save-button btn btn-primary'
                onClick={handleRun}
            >
                {'Run'}
            </button>
            <button
                id='submit-button'
                type='submit'
                onClick={handleSave}
                className='save-button btn btn-primary'
            >
                {'Save'}
            </button>
        </React.Fragment>
    );

    let editorPath = EditorPath.frontend;
    let textContent = frontendText;
    if (currentTab === EditorTabs.backend) {
        editorPath = EditorPath.backend;
        textContent = backendText;
    }

    const form = (
        <div>
            <label>{'Preset views'}</label>
            <select
                className='form-control'
                onChange={e => setSelectedTemplate(e.target.value)}
                value={selectedTemplate}
            >
                {[initialSelectedTemplate, github, zoom].map(((schema, i) => (
                    <option key={i} value={schema.frontend.label}>
                        {schema.frontend.label}
                    </option>
                )))}
            </select>
            <label>{'Name'}</label>
            <input
                className='form-control'
                onChange={e => setName(e.target.value)}
                value={name}
            />
            {buttons}
            <div style={{height: '20px'}} />

            <div>
                <fieldset>
                    <label>Frontend</label>
                    <input
                        type='radio'
                        name={EditorTabs.frontend}
                        onChange={() => setCurrentTab(EditorTabs.frontend)}
                        checked={currentTab === EditorTabs.frontend}
                    />
                </fieldset>
                <fieldset>
                    <label>Backend</label>
                    <input
                        type='radio'
                        name={EditorTabs.backend}
                        onChange={() => setCurrentTab(EditorTabs.backend)}
                        checked={currentTab === EditorTabs.backend}
                    />
                </fieldset>
            </div>

            <Editor
                onEditorDidMount={onEditorDidMount}
                path={editorPath}
                save={handleRun}
                cancel={handleSave}
                onTextChange={onTextChange}
                value={textContent}
            />
        </div>
    );

    return (
        <>
            <Modal.Header closeButton={true}>
                <Modal.Title>{'App Bar RHS View Editor'}</Modal.Title>
            </Modal.Header>
            <form
                role='form'
                onSubmit={handleRun}
            >
                <Modal.Body
                    style={style.modalBody}
                >
                    {error}
                    {form}
                </Modal.Body>
            </form>
        </>
    );
}
