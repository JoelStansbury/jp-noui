import { JupyterFrontEnd, JupyterFrontEndPlugin } from '@jupyterlab/application';

import { ISplashScreen } from '@jupyterlab/apputils';

import { DisposableDelegate } from '@lumino/disposable';

import { PromiseDelegate } from '@lumino/coreutils';

import { NotebookPanel, INotebookTracker } from '@jupyterlab/notebook';
// import { INotebookTracker } from '@jupyterlab/notebook';

import { IFileBrowserCommands } from '@jupyterlab/filebrowser';

import { PageConfig } from '@jupyterlab/coreutils';

const body = document.body;
body.dataset.nouiState = 'loading';

const exit_btn = document.createElement('button');
exit_btn.id = 'jp-noui-exit-btn';

/**
 * A splash screen for jp-noui
 */
const splash: JupyterFrontEndPlugin<ISplashScreen> = {
  id: 'jp-noui:plugin',
  autoStart: true,
  requires: [IFileBrowserCommands, INotebookTracker],
  provides: ISplashScreen,
  activate: (app: JupyterFrontEnd, fb: any, tracker: INotebookTracker) => {
    console.log('JupyterLab extension jp-noui is activated!');
    body.dataset.nouiState = 'activating';

    const nbPath = PageConfig.getOption('noui_notebook');
    const ready = new PromiseDelegate<void>();
    const nbCache = new Set();

    function autoRunAll(_: INotebookTracker, nbp: NotebookPanel | null) {
      if (nbp && !nbCache.has(nbp.title.label)) {
        nbCache.add(nbp.title.label);

        console.log(`noui: Running Notebook ${nbp.title.label}"`);
        body.dataset.nouiState = 'open';
        nbp.sessionContext.ready.then(async () => {
          body.dataset.nouiState = 'running';
          await app.commands.execute('notebook:run-all-cells');
          body.dataset.nouiState = 'ready';
          ready.resolve(void 0);
        });
      }
    }

    function runOne(_: INotebookTracker, nbp: NotebookPanel | null) {
      if (nbp && nbPath.endsWith(nbp.title.label)) {
        nbCache.add(nbp.title.label);
        tracker.currentChanged.disconnect(runOne);
        console.log(`noui: Running Notebook ${nbp.title.label}"`);
        body.dataset.nouiState = 'open';
        nbp.sessionContext.ready.then(async () => {
          body.dataset.nouiState = 'running';
          await app.commands.execute('notebook:run-all-cells');
          body.dataset.nouiState = 'ready';
          ready.resolve(void 0);
        });
        tracker.currentChanged.connect(autoRunAll);
      }
    }

    exit_btn.addEventListener('click', e => {
      console.log('noui: Exited noui mode... Deactivating autorun');
      tracker.currentChanged.disconnect(autoRunAll);
      document.body.removeChild(exit_btn);
      document.getElementById('jp-noui-style')?.remove();

      // Force Layout Recalculation
      // document.body.style.scale = '1';
      window.dispatchEvent(new Event('resize'));
    });

    if (nbPath.length > 0) {
      void app.commands.execute('filebrowser:open-path', { path: nbPath });
      tracker.currentChanged.connect(runOne);
      document.body.appendChild(exit_btn); // Show button to exit
    } else {
      console.log('noui: No Notebook provided. Exiting to JupyterLab');
      body.dataset.nouiState = 'ready';
      ready.resolve(void 0);
    }

    return {
      show: () => {
        return new DisposableDelegate(async () => {
          await ready.promise;
        });
      }
    };
  }
};

export default splash;
