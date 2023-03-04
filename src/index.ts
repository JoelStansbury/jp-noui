import { JupyterFrontEnd, JupyterFrontEndPlugin } from '@jupyterlab/application';

import { ISplashScreen } from '@jupyterlab/apputils';

import { DisposableDelegate } from '@lumino/disposable';

import { PromiseDelegate } from '@lumino/coreutils';

import { NotebookPanel, INotebookTracker } from '@jupyterlab/notebook';

import {IFileBrowserCommands} from '@jupyterlab/filebrowser'

import { PageConfig } from '@jupyterlab/coreutils';

const body = document.body;
body.dataset.nouiState = "loading";

const exit_btn = document.createElement('button');
exit_btn.classList.add('jp-noui-exit-btn');
exit_btn.addEventListener('click', e => {
  console.log('clicked');
  document.body.removeChild(exit_btn);
  document.getElementById("jp-noui-style")?.remove();
});


/**
 * A splash screen for jp-noui
 */
const splash: JupyterFrontEndPlugin<ISplashScreen> = {
  id: 'jp-noui:plugin',
  autoStart: true,
  requires: [IFileBrowserCommands, INotebookTracker],
  provides: ISplashScreen,
  activate: (app: JupyterFrontEnd, fb:any, tracker: INotebookTracker) => {
    
    body.dataset.nouiState = "activating"; 
    const nbPath = PageConfig.getOption("noui_notebook");
    console.log(`Will load ${nbPath}`);
    
    const ready = new PromiseDelegate<void>();
    document.body.appendChild(exit_btn); // Show button to exit

    void app.commands.execute('filebrowser:open-path', { path: nbPath });

    tracker.currentChanged.connect((_: INotebookTracker, nbp: NotebookPanel | null) => {
      if (nbp) {
        body.dataset.nouiState = "open";
        nbp.sessionContext.ready.then(async () => {
          body.dataset.nouiState = "running";
          await app.commands.execute('notebook:run-all-cells');
          ready.resolve(void 0);
        });
      }
    });

    return {
      show: () => {
        return new DisposableDelegate(async () => {
          await ready.promise;
          // document.getElementById("jp-noui-splash")?.remove();
          body.dataset.nouiState = "ready";
        });
      }
    };
  }
};

export default splash;
