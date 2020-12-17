import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { RouterStateSerializer, StoreRouterConnectingModule } from '@ngrx/router-store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { StoreModule, ActionReducer, MetaReducer, INIT } from '@ngrx/store';
import { localStorageSync } from 'ngrx-store-localstorage';

import { AppConfig } from '../../environments/environment';

import { logoutReducer } from './reducers/auth.reducers';

import { CustomSerializer, effects, reducers } from '.';

export function localStorageSyncReducer(reducer: ActionReducer<any>): ActionReducer<any> {
  return localStorageSync({
    keys: [{mail: ['decryptedSubjects']}],
    removeOnUndefined: true,
    storageKeySerializer: (key) => `ctemplar_${key}`,
  })(reducer);
}

export function rehydrateMetaReducer(reducer: ActionReducer<any>): ActionReducer<any> {
  return function(state, action) {
    const nextState = reducer(state, action);
    
    if (action.type === INIT) {
      const storageValue = localStorage.getItem("ctemplar_mail");
      try {
        const parsedStorageValue = JSON.parse(storageValue);
        if (parsedStorageValue && parsedStorageValue['decryptedSubjects']) {
          const retVal = {...nextState, mail: {...nextState.mail, ...parsedStorageValue}}
          return retVal;
        }
      } catch {
        localStorage.removeItem("ctemplar_mail");
      }
    }
 
    return nextState;
  };
}

const metaReducers: Array<MetaReducer<any, any>> = [rehydrateMetaReducer, localStorageSyncReducer, logoutReducer];
@NgModule({
  imports: [
    EffectsModule.forRoot(effects),
    StoreModule.forRoot(reducers, { metaReducers }),
    StoreDevtoolsModule.instrument({ maxAge: 100, logOnly: AppConfig.production }),
    StoreRouterConnectingModule.forRoot(),
  ],
  providers: [{ provide: RouterStateSerializer, useClass: CustomSerializer }],
})
export class AppStoreModule {}
