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

var autorun = true;
var splash_is_visible = false;

const splash_element = document.createElement('div');
splash_element.classList.add('jp-noui-splash-screen');
const loading_anim = document.createElement('div');
loading_anim.classList.add("ring");
splash_element.appendChild(loading_anim)

const exit_btn = document.createElement('button')
exit_btn.classList.add("jp-noui-exit-btn");
exit_btn.innerHTML = "Exit Appmode"
exit_btn.addEventListener('click', (e) => {
  console.log("clicked")
  document.body.removeChild(style);
  document.body.removeChild(exit_btn);
  autorun = false;
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
  bottom: 1px;
  left: 1px;
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

.ring
{
  position:absolute;
  top:50%;
  left:50%;
  transform:translate(-50%,-50%);
  width:150px;
  height:150px;
  background:transparent;
  border:8px solid #ffffff;
  border-radius:50%;
}
.ring:before
{
  content:'';
  position:absolute;
  top:-8px;
  left:-8px;
  width:100%;
  height:100%;
  border:8px solid transparent;
  border-top:8px solid #ff8539;
  border-right:8px solid #ff8539;
  border-radius:50%;
  animation:animate 1.2s linear infinite;
}
@keyframes animate
{
  0%
  {
    transform:rotate(0deg);
  }
  100%
  {
    transform:rotate(360deg);
  }
}
`

const splash: JupyterFrontEndPlugin<ISplashScreen> = {
  id: '@jp-noui/jp-noui:plugin',
  autoStart: true,
  requires: [INotebookTracker],
  provides: ISplashScreen,
  activate: (
    app: JupyterFrontEnd,
    tracker: INotebookTracker,
  ) => {

    document.body.appendChild(style);  // Hide jlab ui
    document.body.appendChild(splash_element);  // Show splash screen
    splash_is_visible = true;
    document.body.appendChild(exit_btn);  // Show button to exit

    // Add listener to NotebookTracker
    tracker.currentChanged.connect((_: INotebookTracker, nbp: NotebookPanel | null) => {
      if (nbp && autorun) {
        nbp.sessionContext.ready.then(() => {
          app.commands.execute("notebook:run-all-cells");
          if (splash_is_visible) {
            document.body.removeChild(splash_element);
            splash_is_visible = false;
          }
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