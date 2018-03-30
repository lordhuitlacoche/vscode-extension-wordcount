import {window, commands, Disposable, ExtensionContext, StatusBarAlignment, StatusBarItem, TextDocument} from 'vscode';

// This method is called when the extension is activated
export function activate(context: ExtensionContext){

    console.log('Congrats, "WordCount" is now active!');

    // create new word counter
    let wordCounter = new WordCounter();
    let controller = new WordCounterController(wordCounter);

    // Add to a list of disposables which are disposed when the extension is deactivated
    context.subscriptions.push(controller);
    context.subscriptions.push(wordCounter);
}

class WordCounter {
    
    private _statusBarItem: StatusBarItem;

    public updateWordCount() {

        // Create as needed
        if(!this._statusBarItem){
            this._statusBarItem = window.createStatusBarItem(StatusBarAlignment.Left);
        }

        // Get the current text editor
        let editor = window.activeTextEditor;
        if(!editor){
            this._statusBarItem.hide();
            return;
        }

        let doc = editor.document;

        // Only update status if it's a Markdown file
        if(doc.languageId === "markdown"){
            let WordCount = this._getWordCount(doc);

            // Update status bar
            this._statusBarItem.text = WordCount !== 1 ? `$(keyboard) ${WordCount} Words` : '$(keyboard) 1 Word';
            this._statusBarItem.show();
        } else {
            this._statusBarItem.hide();
        }
    }

    public _getWordCount(doc: TextDocument): number {

        let docContent = doc.getText();

        // Parse out whitespace
        docContent = docContent.replace(/(< ([^>]+)<)/g, '').replace(/\s+/g, ' ');
        docContent = docContent.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
        let wordCount = 0;
        if(docContent != ""){
            wordCount = docContent.split(" ").length;
        }

        return wordCount;
    }

    dispose() {
        this._statusBarItem.dispose();
    }
}

class WordCounterController {

    private _wordCounter: WordCounter;
    private _disposable: Disposable;

    constructor(wordCounter: WordCounter){
        this._wordCounter = wordCounter;

        // Subscribe to selection change and editor activation
        let subscriptions: Disposable[] = [];
        window.onDidChangeTextEditorSelection(this._onEvent, this, subscriptions);
        window.onDidChangeActiveTextEditor(this._onEvent, this, subscriptions);

        // update word counter
        this._wordCounter.updateWordCount();

        // create a combined disposable from both event subscriptions
        this._disposable = Disposable.from(...subscriptions);
    }

    dispose() {
        this._disposable.dispose();
    }

    private _onEvent() {
        this._wordCounter.updateWordCount();
    }

}