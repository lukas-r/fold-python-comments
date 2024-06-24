# fold-python-comments

This extension allows users to fold, unfold, or toggle multi-line comments in Python files. It is a useful tool to make the code more organized and improve readability.

## Features

- **Folding Multi-line Comments**: Automatically fold multi-line comments when opening a Python file.
- **Unfolding Multi-line Comments**: Allows the user to unfold folded comments to view the full comment text.
- **Toggling Fold State**: Quickly toggle between folded and unfolded states of comments.

## Requirements

This extension requires VS Code version 1.90.0 or higher.

## Extension Settings

This extension adds the following settings:

- `foldPythonComments.autoFoldOnOpen`: Automatically fold multi-line comments when opening a Python file. This option is disabled by default.

## Known Issues

Currently, there are no known issues. If you encounter a problem, please open an issue in the [GitHub repository](#).

## Release Notes

### 0.0.1

- Initial release of the extension.

## Development

### Preparation

To develop or debug the extension, make sure you have Node.js and npm installed. Then, run `npm install` in the root directory of the project to install the dependencies.

### Build

To build the extension, run the following command:

```sh
npm run compile