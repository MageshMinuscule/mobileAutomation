// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  firebase: {
    apiKey: "your_apiKey",
    authDomain: "your_authDomain",
    databaseURL: "your_databaseURL",
    projectId: "your_projectId",
    storageBucket: "your_storageBucket",
    messagingSenderId: "your_messagingSenderId"
  },
  fireBaseConfig:{
    // Cryotos
    apiKey: "AIzaSyBiSoZZQ42ML4z5wKJlZty3zuhKhq2zGUU",
    authDomain: "cmms-production-895632147.firebaseapp.com",
    databaseURL: "https://cmms-production-895632147.firebaseio.com",
    projectId: "cmms-production-895632147",
    storageBucket: "cmms-production-895632147.appspot.com",
    messagingSenderId: "749447955380"
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
