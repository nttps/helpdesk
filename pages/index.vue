<template>
    <div class="overflow-y-auto overflow-x-hidden">
        <div>
            <USelectMenu v-model="searchYear" :options="['2567']" />
        </div>

        <div>
            <div class="text-2xl font-bold mt-8 underline">
                สถิติ
            </div>
            <div class="lg:grid grid-cols-2 gap-2">
                <div class=" border rounded border-black p-2">
                    <div class="text-xl font-bold mb-2">แจ้งปัญหา</div>
                    <div class="lg:grid grid-cols-2">
                        <div>
                            <highcharts :options="repairStackOptions" ></highcharts>
                        </div>
                        <div>
                            <highcharts :options="repairOptions" v-if="repairPieOption.length > 0"></highcharts>
                        </div>
                    </div>
                </div>
                <div class="border rounded border-black p-2">
                    <div class="text-xl font-bold mb-2">ยืม-คืน</div>
                    <div class="lg:grid grid-cols-2">
                        <div>
                            <highcharts :options="borrowStackOptions" ></highcharts>
                        </div>
                        <div>
                            <highcharts :options="borrowOptions" v-if="borrowPieOption.length > 0"></highcharts>
                        </div>
                    </div>
                </div>
                <div class="border rounded border-black p-2">
                    <div class="text-xl font-bold mb-2">CCTV</div>
                    <div class="lg:grid grid-cols-2">
                        <div>
                            <highcharts :options="cctvStackOptions" ></highcharts>
                        </div>
                        <div>
                            <highcharts :options="cctvOptions" v-if="cctvPieOption.length > 0"></highcharts>
                        </div>
                    </div>
                </div>
            </div>
        </div>
       

        <div>
            <div class="text-2xl font-bold mt-8 underline">รายการอนุมัติ</div>

            <div>
                <UTabs :items="tabItems" class="w-full">
                    <template #repair="{ item }">
                        <DashboardRepairTable />
                    </template>

                    <template #borrow="{ item }">

                    </template>
                    <template #cctv="{ item }">

                    </template>

                </UTabs>

            </div>
        </div>
    </div>
    
</template>

<script setup>
    const searchYear = ref('2567')
    const { data: dashboard, pending: pendingDashboard } = await useAsyncData('dashboard', async () => {
        return getApi(`/hd/DashBoardHD/GetBoard01Data?year=${searchYear.value}`)
    }, {
        default: () => [],
        watch: [searchYear]
    })
    function onlyUnique(value, index, array) {
        return array.indexOf(value) === index;
    }

    const borrowPieOption = computed(() => dashboard.value.borrowPieChart.map(e => {
        return { name: e.description, y: e.value}
    }))

    const borrowStackCate = computed(() => dashboard.value.borrowColumnChart.map((e , i)=> {
        return e.series.map(s => s.description)
    }).flat().filter(onlyUnique))
    const borrowStackSeries = computed(() => dashboard.value.borrowColumnChart.map((e , i)=> {
        return {
            name: e.axis_x,
            data: borrowStackCate.value.map((s , i) => {
                const item = e.series.find(a => a.description == s)

                let value 
                if(item !== undefined){
                    value = item.value
                }else{
                    value = 0
                }
                return value
                
            })
        }
    }))

    const repairStackCate = computed(() => dashboard.value.repairColumnChart.map((e , i)=> {
        return e.series.map(s => s.description)
    }).flat().filter(onlyUnique))

    const repairStackSeries = computed(() => dashboard.value.repairColumnChart.map((e , i)=> {
        return {
            name: e.axis_x,
            data: repairStackCate.value.map((s , i) => {
                const item = e.series.find(a => a.description == s)

                let value 
                if(item !== undefined){
                    value = item.value
                }else{
                    value = 0
                }
                return value
                
            })
        }
    }))

    const repairPieOption = computed(() => dashboard.value.repairPieChart.map(e => {
        return { name: e.description, y: e.value}
    }))

    const cctvPieOption = computed(() => dashboard.value.cctvPieChart.map(e => {
        return { name: e.description, y: e.value}
    }))
    const cctvStackCate = computed(() => dashboard.value.cctvColumnChart.map((e , i)=> {
        return e.series.map(s => s.description)
    }).flat().filter(onlyUnique))


    const cctvStackSeries = computed(() => dashboard.value.cctvColumnChart.map((e , i)=> {
        return {
            name: e.axis_x,
            data: cctvStackCate.value.map((s , i) => {
                const item = e.series.find(a => a.description == s)

                let value 
                if(item !== undefined){
                    value = item.value
                }else{
                    value = 0
                }
                return value
                
            })
        }
    }))
    const borrowStackOptions = ref({
        chart: {
            type: 'column'
        },

        title: {
            text: '',
        },

        xAxis: {
            categories: borrowStackCate.value
        },

        yAxis: {
            allowDecimals: false,
            min: 0,
            title: {
                text: ''
            }
        },

        tooltip: {
            format: '<b>{key}</b><br/>{series.name}: {y}<br/>' +
                'Total: {point.stackTotal}'
        },

        plotOptions: {
            column: {
                stacking: 'normal'
            }
        },

        series: borrowStackSeries.value
    })
   

    const borrowOptions = ref({
        chart: {
          plotBackgroundColor: null,
          plotBorderWidth: null,
          plotShadow: false,
          type: 'pie',
        },
        title: {
          text: ''
        },
        tooltip: {
          headerFormat: '<b>{point.key}<br>',
          pointFormat: '{series.name}: {point.y}</b>'
        },
        plotOptions: {
          pie: {
            allowPointSelect: true,
            cursor: 'pointer',
            dataLabels: {
              enabled: true,
              format: '<b>{point.name}: {point.percentage:.1f} % </b>'
            }
          }
        },
        legend: {
          floating: true,
          borderColor: '#CCC',
          borderWidth: 1,
        },
        series: [{
            name: 'จำนวน',
            colorByPoint: true,
            allowPointSelect: true,
            keys: ['name', 'y', 'selected', 'sliced'],
            data: borrowPieOption.value,
            showInLegend: true
        }] 
    })

    const repairStackOptions = ref({
        chart: {
            type: 'column'
        },

        title: {
            text: '',
        },

        xAxis: {
            categories: repairStackCate.value
        },

        yAxis: {
            allowDecimals: false,
            min: 0,
            title: {
                text: ''
            }
        },

        tooltip: {
            format: '<b>{key}</b><br/>{series.name}: {y}<br/>' +
                'Total: {point.stackTotal}'
        },

        plotOptions: {
            column: {
                stacking: 'normal'
            }
        },

        series: repairStackSeries.value
    })

    const repairOptions = ref({
        chart: {
          plotBackgroundColor: null,
          plotBorderWidth: null,
          plotShadow: false,
          type: 'pie',
        },
        title: {
          text: ''
        },
        tooltip: {
          headerFormat: '<b>{point.key}<br>',
          pointFormat: '{series.name}: {point.y}</b>'
        },
        plotOptions: {
          pie: {
            allowPointSelect: true,
            cursor: 'pointer',
            dataLabels: {
              enabled: true,
              format: '<b>{point.name}: {point.percentage:.1f} % </b>'
            }
          }
        },
        legend: {
          floating: true,
          borderColor: '#CCC',
          borderWidth: 1,
        },
        series: [{
            name: 'จำนวน',
            colorByPoint: true,
            allowPointSelect: true,
            keys: ['name', 'y', 'selected', 'sliced'],
            data: repairPieOption.value,
            showInLegend: true
        }] 
    })

    const cctvStackOptions = ref({
        chart: {
            type: 'column'
        },

        title: {
            text: '',
        },

        xAxis: {
            categories: cctvStackCate.value
        },

        yAxis: {
            allowDecimals: false,
            min: 0,
            title: {
                text: ''
            }
        },

        tooltip: {
            format: '<b>{key}</b><br/>{series.name}: {y}<br/>' +
                'Total: {point.stackTotal}'
        },

        plotOptions: {
            column: {
                stacking: 'normal'
            }
        },

        series: cctvStackSeries.value
    })
   
    
    const cctvOptions = ref({
        chart: {
          plotBackgroundColor: null,
          plotBorderWidth: null,
          plotShadow: false,
          type: 'pie',
        },
        title: {
          text: ''
        },
        tooltip: {
          headerFormat: '<b>{point.key}<br>',
          pointFormat: '{series.name}: {point.y}</b>'
        },
        plotOptions: {
          pie: {
            allowPointSelect: true,
            cursor: 'pointer',
            dataLabels: {
              enabled: true,
              format: '<b>{point.name}: {point.percentage:.1f} % </b>'
            }
          }
        },
        legend: {
          floating: true,
          borderColor: '#CCC',
          borderWidth: 1,
        },
        series: [{
            name: 'จำนวน',
            colorByPoint: true,
            allowPointSelect: true,
            keys: ['name', 'y', 'selected', 'sliced'],
            data: cctvPieOption.value,
            showInLegend: true
        }] 
    })



    const tabItems = [{
        label: 'แจ้งปัญหา',
        slot: 'repair'
    }, {
        label: 'ยืมคืน',
        slot: 'borrow'
    }, {
        label: 'CCTV',
        slot: 'cctv'
    }]
    
</script>

<style lang="scss" scoped>

</style>