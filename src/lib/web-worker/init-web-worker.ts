import { CSSStyleSheet } from './worker-style';
import { defineWorkerInterface, patchPrototypes } from './worker-define-constructors';
import { logWorker } from '../log';
import type { InitWebWorkerData } from '../types';
import { Node } from './worker-node';
import type { PartytownConfig } from '@builder.io/partytown/intergration';
import { Performance } from './worker-performance';
import { webWorkerCtx } from './worker-constants';
import { Window } from './worker-window';

export const initWebWorker = (initWebWorkerData: InitWebWorkerData) => {
  const config: PartytownConfig = (webWorkerCtx.$config$ = JSON.parse(initWebWorkerData.$config$));

  const functionify = (configName: keyof PartytownConfig) => {
    if (config[configName]) {
      config[configName] = new Function('return ' + config[configName])();
    }
  };

  const fnConfigs: (keyof PartytownConfig)[] = ['resolveUrl', 'get', 'set', 'apply'];
  fnConfigs.map(functionify);

  webWorkerCtx.$importScripts$ = importScripts.bind(self);
  webWorkerCtx.$libPath$ = initWebWorkerData.$libPath$;
  webWorkerCtx.$localStorage$ = initWebWorkerData.$localStorage$;
  webWorkerCtx.$sessionStorage$ = initWebWorkerData.$sessionStorage$;
  webWorkerCtx.$postMessage$ = (postMessage as any).bind(self);
  webWorkerCtx.$sharedDataBuffer$ = initWebWorkerData.$sharedDataBuffer$;

  (self as any).postMessage = (self as any).importScripts = undefined;

  (self as any).Node = Node;
  (self as any).Window = Window;
  (self as any).CSSStyleSheet = CSSStyleSheet;
  (self as any).Performance = Performance;

  initWebWorkerData.$interfaces$.map(defineWorkerInterface);

  patchPrototypes();

  webWorkerCtx.$isInitialized$ = 1;

  logWorker(`Initialized web worker`);
};
