import FrontendJSONSchema from './frontend-json-schema.json';
import BackendJSONSchema from './backend-json-schema.json';

export enum EditorPath {
    frontend = 'app-view-builder-frontend.json',
    backend = 'app-view-builder-backend.json',
}

export const useMonaco = () => {
    return (editor: any, monaco: any) => {
        registerJSONSchema(monaco);
    };
};

function registerJSONSchema(monaco: any) {
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
        validate: true,
        schemas: [
            {
                uri: `http://app-view-builder/${EditorPath.frontend}`,
                fileMatch: [EditorPath.frontend],
                schema: FrontendJSONSchema.definitions.AppBinding,
            },
            {
                uri: `http://app-view-builder/${EditorPath.backend}`,
                fileMatch: [EditorPath.backend],
                schema: BackendJSONSchema,
            },
        ],
    });
}
