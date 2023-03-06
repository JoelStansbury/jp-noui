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
      if (nbp && !nbCache.has(nbp.context.path)) {
        nbCache.add(nbp.context.path);
        console.log(`noui: Running Notebook "${nbp.context.path}"`);

        body.dataset.nouiState = 'open';
        nbp.sessionContext.ready.then(async () => {
          body.dataset.nouiState = 'running';
          await app.commands.execute('notebook:run-all-cells');
          body.dataset.nouiState = 'ready';
        });
      }
    }

    function runOne(_: INotebookTracker, nbp: NotebookPanel | null) {
      if (nbp && nbPath.endsWith(nbp.context.path) && !nbCache.has(nbp.context.path)) {
        nbCache.add(nbp.context.path);
        console.log(`noui: Running Initial Notebook "${nbp.context.path}"`);

        body.dataset.nouiState = 'open';
        nbp.sessionContext.ready.then(async () => {
          body.dataset.nouiState = 'running';
          await app.commands.execute('notebook:run-all-cells');
          body.dataset.nouiState = 'ready';
          ready.resolve(void 0);
        });
      }
    }

    exit_btn.addEventListener('click', e => {
      console.log('noui: Exited noui mode... Deactivating autorun');
      document.body.removeChild(exit_btn);
      document.getElementById('jp-noui-style')?.remove();
      tracker.currentChanged.disconnect(autoRunAll);

      // Force CSS Recalculation
      document.body.style.zoom = '0.999';
      window.dispatchEvent(new Event('resize'));
      setTimeout(() => {
        document.body.style.zoom = '1';
        window.dispatchEvent(new Event('resize'));
      }, 500);
    });

    if (nbPath.length > 0) {
      void app.commands.execute('filebrowser:open-path', { path: nbPath });
      tracker.currentChanged.connect(runOne);
      document.body.appendChild(exit_btn); // Show button to exit
      return {
        show: () => {
          return new DisposableDelegate(async () => {
            await ready.promise;
            tracker.currentChanged.disconnect(runOne);
            tracker.currentChanged.connect(autoRunAll);
          });
        }
      };
    } else {
      console.log('noui: No Notebook provided. Exiting to JupyterLab');
      return {
        show: () => {
          return new DisposableDelegate(() => {
            document.getElementById('jp-noui-style')?.remove();
            body.dataset.nouiState = 'ready';
          });
        }
      };
    }
  }
};

export default splash;
