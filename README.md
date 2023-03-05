# jp_noui

[![Github Actions Status](https://github.com/JoelStansbury/jp_noui/workflows/Build/badge.svg)](https://github.com/JoelStansbury/jp_noui/actions/workflows/build.yml)
Hides all jupyter UI elements leaving only cell outputs (notebooks are auto executed).

## Requirements

- JupyterLab >= 3.0

## Install

To install the extension, execute:

```bash
pip install jp_noui
```

## Uninstall

To remove the extension, execute:

```bash
pip uninstall jp_noui
```

## Configuration

see `binder/jupyter_config.json` for an example. Config options are expected to be found in ServerApp.tornado_settings.page_config_data.

- `noui_splash_html`: Path to html file to show until the notebook finishes execution.
- `noui_style_css`: Path to css stylesheet to alter the appearance of JupyterLab.
- `noui_notebook`: Path to notebook to open and execute on launch.

While none of these options are required, if `noui_notebook` is missing, then every notebook will be auto-executed as soon as it is activated, and you'll need to do something to ensure the correct notebook is loaded, e.g. by adding `tree/path/to/your/notebook.ipynb` to the url used to launch the app.

## Contributing

### Development install

Note: You will need NodeJS to build the extension package.

The `jlpm` command is JupyterLab's pinned version of
[yarn](https://yarnpkg.com/) that is installed with JupyterLab. You may use
`yarn` or `npm` in lieu of `jlpm` below.

```bash
# Clone the repo to your local environment
# Change directory to the jp_noui directory
# Install package in development mode
pip install -e "."
# Link your development version of the extension with JupyterLab
jupyter labextension develop . --overwrite
# Rebuild extension Typescript source after making changes
jlpm build
```

You can watch the source directory and run JupyterLab at the same time in different terminals to watch for changes in the extension's source and automatically rebuild the extension.

```bash
# Watch the source directory in one terminal, automatically rebuilding when needed
jlpm watch
# Run JupyterLab in another terminal
jupyter lab
```

With the watch command running, every saved change will immediately be built locally and available in your running JupyterLab. Refresh JupyterLab to load the change in your browser (you may need to wait several seconds for the extension to be rebuilt).

By default, the `jlpm build` command generates the source maps for this extension to make it easier to debug using the browser dev tools. To also generate source maps for the JupyterLab core extensions, you can run the following command:

```bash
jupyter lab build --minimize=False
```

### Development uninstall

```bash
pip uninstall jp_noui
```

In development mode, you will also need to remove the symlink created by `jupyter labextension develop`
command. To find its location, you can run `jupyter labextension list` to figure out where the `labextensions`
folder is located. Then you can remove the symlink named `jp-noui` within that folder.

### Testing the extension

#### Frontend tests

This extension is using [Jest](https://jestjs.io/) for JavaScript code testing.

To execute them, execute:

```sh
jlpm
jlpm test
```

#### Integration tests

This extension uses Playwright for the integration tests (aka user level tests).
More precisely, the JupyterLab helper [Galata](https://github.com/jupyterlab/jupyterlab/tree/master/galata) is used to handle testing the extension in JupyterLab.

More information are provided within the [ui-tests](./ui-tests/README.md) README.

### Packaging the extension

See [RELEASE](RELEASE.md)
