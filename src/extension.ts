
import path = require('path');
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {

	let subs = context.subscriptions;

	console.log('Congratulations, your extension "typescrptmscodestyle" is now active!');

	let disposable = vscode.commands.registerCommand('typescrptmscodestyle.addcodestylecomment', (...args) => {
		//console.log(args);
		if (args && args[0] instanceof vscode.Uri) {
			let uri = args[0] as vscode.Uri;
			let uristr = uri.toString();
			let editor = vscode.window.visibleTextEditors.find(v => v.document.uri.toString() === uristr);
			if (editor) {
				addMsCodeStyleAssistComment(editor);
			}

		}
		else {
			if (vscode.window.activeTextEditor && vscode.window.activeTextEditor!.document.uri
				&& path.extname(vscode.window.activeTextEditor!.document.uri.fsPath).toLowerCase() === ".ts") {
				addMsCodeStyleAssistComment(vscode.window.activeTextEditor);
			}
		}

	});

	subs.push(disposable);
}

export function deactivate() { }

function hasNoLineComment(text: string, firstNonWhitespaceCharacterIndex: number) {
	return text.indexOf("//", firstNonWhitespaceCharacterIndex) < 0;
}

/**
 * 增加ms风格代码格式化辅助注释
 */
function addMsCodeStyleAssistComment(editor: vscode.TextEditor) {

	let uri = editor.document.uri;
	let doc = editor.document;
	let lineCount = doc.lineCount;
	let awaitInsertPostions: { line: number, character: number, space: string, end: string }[] = [];
	for (let i = 0; i < lineCount; i++) {
		let line = doc.lineAt(i);
		let text = line.text;
		if (text.substring(text.length - 1) === '{'
			&& line.firstNonWhitespaceCharacterIndex !== text.length - 1
			&& hasNoLineComment(text, line.firstNonWhitespaceCharacterIndex)) {
			awaitInsertPostions.push({
				line: i, character: text.length - 1,
				space: (text.substring(text.length - 2) === ' ' ? "" : " "),
				end: text.substring(0, line.firstNonWhitespaceCharacterIndex)
			});
		}
	}
	if (awaitInsertPostions.length > 0) {
		editor.edit(ed => {
			awaitInsertPostions.forEach(a => {
				ed.insert(new vscode.Position(a.line, a.character), a.space + "//\n" + a.end);
			});
		}).then(b => {
			if (b) {
				vscode.commands.executeCommand("editor.action.formatDocument", uri);
			}
		});
	}
}

