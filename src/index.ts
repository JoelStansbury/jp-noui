import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
} from '@jupyterlab/application';

import {
  ISplashScreen, 
} from '@jupyterlab/apputils';

import { 
  DisposableDelegate 
} from '@lumino/disposable';

import { INotebookTracker, NotebookPanel } from '@jupyterlab/notebook';


const splash_element = document.createElement('div');
splash_element.classList.add('jp-noui-splash-screen');
splash_element.innerHTML = "Loading...";

const exit_btn = document.createElement('button')
exit_btn.classList.add("jp-noui-exit-btn");
exit_btn.innerHTML = "Exit Appmode"
exit_btn.addEventListener('click', (e) => {
  console.log("clicked")
  document.body.removeChild(style);
  document.body.removeChild(exit_btn);
});

const style = document.createElement('style')
style.innerHTML = `
#jp-top-panel {display:none;}
#jp-bottom-panel {display:none;}
#jp-left-stack {display:none;}
.jp-SideBar.lm-TabBar {display: none;}
.jp-Notebook.jp-mod-scrollPastEnd::after {display: none;}
.jp-Cell-inputWrapper {display: none;}
.jp-OutputPrompt {display: none;}
.jp-Cell {padding:0}
.jp-cell-menu {display: none;}
.lm-TabBar {display: none;}
.jp-Toolbar {display: none;}
.jp-Collapser {display: none;}
.jp-Notebook {
  padding: 0;
  top: 0 !important;
  left:0 !important;
  height: 100% !important;
  width: 100% !important;
}
#jp-main-vsplit-panel {
  top: 0 !important;
  left: 0 !important;
  height: 100% !important;
  width: 100% !important;
}
#jp-main-content-panel {
  top: 0 !important;
  left: 0 !important;
  height: 100% !important;
  width: 100% !important;
}
#jp-main-dock-panel {
  top: 0 !important;
  left: 0 !important;
  height: 100% !important;
  width: 100% !important;
}
.jp-NotebookPanel {
  top: 0 !important;
  left: 0 !important;
  height: 100% !important;
  width: 100% !important;
}

.jp-noui-exit-btn {
  z-index: 999;
  position: absolute;
  bottom: 0px;
  left: 0px;
  background: white;
  border: none;
  font-family: system-ui;
}
.jp-noui-splash-screen {
  z-index: 1000;
  position: absolute;
  background: white;
  height: 100%;
  width: 100%;
  font-family: system-ui;
}
`

/**
 * A splash screen for jp-noui
 */
const splash: JupyterFrontEndPlugin<ISplashScreen> = {
  id: '@jp-noui/jp-noui:plugin',
  autoStart: true,
  requires: [INotebookTracker],
  provides: ISplashScreen,
  activate: (
    app: JupyterFrontEnd,
    tracker: INotebookTracker,
  ) => {

    document.body.appendChild(style);  // Hide jlab garbage
    document.body.appendChild(splash_element);  // Show splash screen
    document.body.appendChild(exit_btn);  // Show button to exit

    // Add listener to NotebookTracker
    tracker.currentChanged.connect((_: INotebookTracker, nbp: NotebookPanel | null) => {
      if (nbp) {
        nbp.sessionContext.ready.then(() => {
          app.commands.execute("notebook:run-all-cells");
          document.body.removeChild(splash_element);
        });
      }
    });

    return {
      show: () => {
        return new DisposableDelegate(async () => {});
      }
    };
  },
};

export default splash;