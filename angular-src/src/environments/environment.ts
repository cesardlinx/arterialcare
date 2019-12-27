// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.
import * as esLocale from 'date-fns/locale/es';


export const environment = {
  production: false,
  url: 'http://localhost:3000',
  datepickerOptions: {
    minYear: 1970,
    maxYear: 2030,
    displayFormat: 'MMM D[,] YYYY',
    barTitleFormat: 'MMMM YYYY',
    firstCalendarDay: 0, // 0 - Domingo, 1 - Lunes
    locale: esLocale,
    barTitleIfEmpty: 'Da click para seleccionar una fecha'
  }
};
