import Highcharts from "highcharts";
import HighchartsVue from "highcharts-vue";
import stockInit from "highcharts/modules/stock";
import HighchartsExporting from "highcharts/modules/exporting";
import HighchartsAccessibility from "highcharts/modules/accessibility";

export default defineNuxtPlugin((nuxtApp) => {
    if (typeof Highcharts === "object") {
        stockInit(Highcharts);
        HighchartsExporting(Highcharts);
        HighchartsAccessibility(Highcharts);
    }
    Highcharts.setOptions({
        lang: {
            thousandsSep: ",",
        },
    });

    nuxtApp.vueApp.use(HighchartsVue);
});
