import * as vscode from 'vscode';

let foldedState: { [key: string]: boolean } = {};
let documentsToProcess: Set<string> = new Set();

export function activate(context: vscode.ExtensionContext) {
    const foldCommand = vscode.commands.registerCommand('extension.foldPythonMultilineComments', async () => {
        await foldOrUnfoldMultilineComments(true);
    });

    const unfoldCommand = vscode.commands.registerCommand('extension.unfoldPythonMultilineComments', async () => {
        await foldOrUnfoldMultilineComments(false);
    });

    const toggleCommand = vscode.commands.registerCommand('extension.togglePythonMultilineComments', async () => {
        await toggleMultilineComments();
    });

    context.subscriptions.push(foldCommand);
    context.subscriptions.push(unfoldCommand);
    context.subscriptions.push(toggleCommand);

    // Listen for Python files being opened
    vscode.workspace.onDidOpenTextDocument(document => {
        if (document.languageId === 'python') {
            const config = vscode.workspace.getConfiguration('foldPythonComments');
            const autoFoldOnOpen = config.get<boolean>('autoFoldOnOpen');
            console.log(`autoFoldOnOpen setting: ${autoFoldOnOpen}`);
            if (autoFoldOnOpen) {
                handleDocumentOpen(document);
            }
        }
    });

    // Listen for visible text editors change
    vscode.window.onDidChangeVisibleTextEditors(editors => {
        editors.forEach(editor => {
            const document = editor.document;
            if (document.languageId === 'python' && documentsToProcess.has(document.uri.toString())) {
                console.log('Folding multiline comments in newly visible Python file.');
                foldOrUnfoldMultilineComments(true, editor);
                documentsToProcess.delete(document.uri.toString());
            }
        });
    });
}

async function handleDocumentOpen(document: vscode.TextDocument) {
    const editor = vscode.window.visibleTextEditors.find(e => e.document === document);
    if (editor) {
        console.log('Folding multiline comments in opened Python file.');
        await foldOrUnfoldMultilineComments(true, editor);
    } else {
        documentsToProcess.add(document.uri.toString());
    }
}

async function getMultilineCommentRanges(document: vscode.TextDocument): Promise<vscode.Range[]> {
    const text = document.getText();
    const multilineCommentRanges: vscode.Range[] = [];

    const regex = /('''|""")[\s\S]+?\1/g;
    let match;

    while (match = regex.exec(text)) {
        const startPos = document.positionAt(match.index);
        const endPos = document.positionAt(match.index + match[0].length);
        const range = new vscode.Range(startPos, endPos);
        multilineCommentRanges.push(range);
    }

    return multilineCommentRanges;
}

async function foldOrUnfoldMultilineComments(fold: boolean, editor?: vscode.TextEditor) {
    if (!editor) {
        editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }
    }

    const document = editor.document;
    const documentKey = document.uri.toString();
    const multilineCommentRanges = await getMultilineCommentRanges(document);

    const isCurrentlyFolded = foldedState[documentKey] ?? false;

    if (fold === isCurrentlyFolded) {
        return;
    }

    const savedSelections = editor.selections;
    const savedViewState = editor.visibleRanges;

    editor.selections = multilineCommentRanges.map(range => new vscode.Selection(range.start, range.start));

    if (fold) {
        await vscode.commands.executeCommand('editor.fold');
    } else {
        await vscode.commands.executeCommand('editor.unfold');
    }

    editor.selections = savedSelections;

    if (savedViewState.length > 0) {
        editor.revealRange(savedViewState[0], vscode.TextEditorRevealType.AtTop);
    }

    foldedState[documentKey] = fold;
}

async function toggleMultilineComments() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        return;
    }

    const document = editor.document;
    const documentKey = document.uri.toString();

    const isCurrentlyFolded = foldedState[documentKey] ?? false;

    const newFoldState = !isCurrentlyFolded;

    await foldOrUnfoldMultilineComments(newFoldState);
}

export function deactivate() { }