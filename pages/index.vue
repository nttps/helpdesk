<template>
    <div class="overflow-y-auto overflow-x-hidden">
        <div>
            <USelectMenu v-model="searchYear" :options="['2567']" />
        </div>

        <div>
            <div class="text-2xl font-bold mt-8 underline">
                สถิติ
            </div>
            <div class=" border rounded border-black p-2 mb-4">
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
            <div class="border rounded border-black p-2 mb-4">
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
            <div class="border rounded border-black p-2 mb-4">
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
       

        <div>
            <div class="text-2xl font-bold mt-8 underline">รายการอนุมัติ</div>

            <div>
                <UTabs :items="tabItems" class="w-full">
                    <template #repair="{ item }">
                        <div class="flex items-center justify-end space-x-2">
                            <div>
                                <UButton
                                    icon="i-heroicons-plus-20-solid"
                                    size="sm"
                                    variant="solid"
                                    label="อนุมัติ"
                                    :trailing="false"
                                    class="bg-green-600 hover:bg-green-700"
                                    @click="approveRepairHandle"
                                />
                            </div>
                        </div>

                        <DashboardRepairTable v-model="selectedRepairRows" :list-repair="listRepair" :page-from="pageRepairFrom" @refresh="refreshRepair" />
                        <div class="flex flex-wrap justify-between items-center px-3 pt-3.5">
                            <div>
                                <span class="text-sm leading-5">
                                กำลังแสดง
                                <span class="font-medium">{{ pageRepairFrom }}</span>
                                ถึง
                                <span class="font-medium">{{ pageRepairTo }}</span>
                                จาก
                                <span class="font-medium">{{ pageRepairTotal }}</span>
                                รายการ
                                </span>
                            </div>


                            <UPagination 
                                v-model="pageRepair" 
                                :page-count="pageRepairCount" 
                                :total="listRepair.total" 
                            />
                        </div>
                    </template>

                    <template #borrow="{ item }">
                        <div class="flex items-center justify-end space-x-2">
                            <div>
                                <UButton
                                    icon="i-heroicons-plus-20-solid"
                                    size="sm"
                                    variant="solid"
                                    color="green"
                                    label="อนุมัติ"
                                    :trailing="false"
                                    class="mr-2"
                                    @click="approveBorrowHandle"
                                />
                            </div>
                        </div>
                        
                        <DashboardBorrowTable v-model="selectedBorrowRows" :list-borrow="listBorrow" :page-from="pageBorrowFrom" @refresh="refreshBorrow" />
                        <div class="flex flex-wrap justify-between items-center px-3 pt-3.5">
                            <div>
                                <span class="text-sm leading-5">
                                กำลังแสดง
                                <span class="font-medium">{{ pageBorrowFrom }}</span>
                                ถึง
                                <span class="font-medium">{{ pageBorrowTo }}</span>
                                จาก
                                <span class="font-medium">{{ pageBorrowTotal }}</span>
                                รายการ
                                </span>
                            </div>


                            <UPagination 
                                v-model="pageBorrow" 
                                :page-count="pageBorrowCount" 
                                :total="listBorrow.total" 
                            />
                        </div>
                    </template>
                    <template #cctv="{ item }">
                        <div class="flex items-center justify-end space-x-2">
                            <div>
                                <UButton
                                    icon="i-heroicons-plus-20-solid"
                                    size="sm"
                                    variant="solid"
                                    color="green"
                                    label="อนุมัติ"
                                    :trailing="false"
                                    class="mr-2"
                                    @click="approveCCTVHandle"
                                />
                            </div>
                        </div>
                        <DashboardCCTVTable v-model="selectedCCTVRows" :list-c-c-t-v="listCCTV" :page-from="pageCCTVFrom"  @refresh="refreshCCTV"/>
                        <div class="flex flex-wrap justify-between items-center px-3 pt-3.5">
                            <div>
                                <span class="text-sm leading-5">
                                กำลังแสดง
                                <span class="font-medium">{{ pageCCTVFrom }}</span>
                                ถึง
                                <span class="font-medium">{{ pageCCTVTo }}</span>
                                จาก
                                <span class="font-medium">{{ pageCCTVTotal }}</span>
                                รายการ
                                </span>
                            </div>


                            <UPagination 
                                v-model="pageCCTV" 
                                :page-count="pageCCTVCount" 
                                :total="listCCTV.total" 
                            />
                        </div>
                    </template>

                </UTabs>

            </div>
        </div>
    </div>

    <UModal v-model="modalAlertApproveAll">
        <UCard :ui="{ divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
          <template #header>
              <div class="text-center">แจ้งเตือนการยืนยัน</div>
          </template>

          <div class="font-bold text-xl text-center">ต้องการยืนยันอนุมัติข้อมูลทั้งหมดใช่หรือไม่</div>
          <div class="font-bold leading-5 text-lg text-center text-red-600" v-if="approveType == 'borrow'">*ระบบจะทำการอนุมัติข้อมูลทั้งหมด ยกเว้น สถานะ รอตรวจสอบ(ทส.) เนื่องจากท่านจำเป็นจะต้องเลือก Serial ในการยืมอุปกรณ์ในของแต่ละแบบฟอร์ม*</div>


          <template #footer>
              <div class="flex justify-between">
                  <button type="button" class="px-4 py-2 bg-red-600 text-base rounded-[5px] text-white" @click="approveAll">ยืนยัน</button>
                  <button type="button" class="px-4 py-2 bg-gray-500 text-base rounded-[5px] text-white" @click="modalAlertApproveAll = false">ยกเลิก</button>
              </div>
          </template>
        </UCard>
    </UModal>

    <UModal v-model="alertSelect">
        <UCard :ui="{ divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
          <template #header>
              <div class="text-center">เลือกข้อมูลก่อร</div>
          </template>

          <div class="font-bold text-xl text-center">กรุณาเลือกข้อมูลการยืนยันก่อน</div>

          <template #footer>
              <div class="flex justify-center">
                  <button type="button" class="px-4 py-2 bg-green-600 text-base rounded-[5px] text-white" @click="alertSelect = false">ตกลง</button>
              </div>
          </template>
        </UCard>
    </UModal>

    
</template>

<script setup>

    definePageMeta({
        middleware: ["auth"]
    })
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
              format: '<b>{point.name}: {point.percentage:.1f} % </b>',
              distance: -30
            }
          }
        },
        legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'middle',
            itemMarginTop: 10,
            itemMarginBottom: 10,
            floating: true,
            borderColor: '#CCC',
            borderWidth: 1,
            backgroundColor: '#fff',
            x: -30
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
              distance: -30,
              format: '<b>{point.name}: {point.percentage:.1f} % </b>'
            }
          }
        },
        legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'middle',
            itemMarginTop: 10,
            itemMarginBottom: 10,
            floating: true,
            borderColor: '#CCC',
            borderWidth: 1,
            backgroundColor: '#fff',
            x: -30
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
              format: '<b>{point.name}: {point.percentage:.1f} % </b>',
              distance: -30
            }
          }
        },
        legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'middle',
            itemMarginTop: 10,
            itemMarginBottom: 10,
            floating: true,
            borderColor: '#CCC',
            borderWidth: 1,
            backgroundColor: '#fff',
            x: -30
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
    const auth = useAuthStore()

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

    const selectedBorrowRows = ref([])
    const selectedRepairRows = ref([])
    const selectedCCTVRows = ref([])


    const modalAlertApproveAll = ref(false)
    const alertSelect = ref(false)

    const approveType = ref('')


    const approveRepairHandle = () => {
        if(selectedRepairRows.value.length === 0) {
            alertSelect.value = true
            return
        }

        approveType.value = 'repair'
        modalAlertApproveAll.value = true
    }

    const approveCCTVHandle = () => {
        if(selectedCCTVRows.value.length === 0) {
            alertSelect.value = true
            return
        }

        approveType.value = 'cctv'
        modalAlertApproveAll.value = true
    }

    const approveBorrowHandle = () => {
        if(selectedBorrowRows.value.length === 0) {
            alertSelect.value = true
            return
        }

        approveType.value = 'borrow'
        modalAlertApproveAll.value = true
    }
   
    const dataApprove = ref({
        ReqID:"",  
        Action:"",//สถานะมี 2 สถานะคือ  (อนุมัติ , ปฏิเสธ)
        ActiondBy: auth.username,//อนุมัติหรือปฏิเสธโดย
        Reason:""//เหตุผลการไม่อนุมัติ ถ้าอนุมัติไม่ต้องใส่
    })

    const approveRepairAll = async () => {
        if((auth.user.userInGroups.some(g => g.userGroupId === 'ผู้อนุมัติแจ้งซ่อมประจำหน่วยงาน' && g.isInGroup === true) ) || (auth.user.userInGroups.some(g => g.userGroupId === 'ผู้ตรวจสอบการแจ้งซ่อม(ทส.)'  && g.isInGroup === true))) {
            const dataApproveed =  selectedRepairRows.value.filter(re => re.status != 'ซ่อมเสร็จ' && re.status != 'ส่งซ่อม' && re.status != 'ปฏิเสธจากหน่วยงาน').map(re => re.req_id).join(',')
        
            dataApprove.value.Action = 'อนุมัติ'
            dataApprove.value.ReqID = dataApproveed

            modalAlertApproveAll.value = false
            const res = await postApi('/hd/request/ApproveDocument', dataApprove.value)

            selectedRepairRows.value = []

            refreshRepair()
            return
        }

        modalAlertApproveAll.value = false
        return alert('คุณไม่มีสิทธิ์ในการจัดการ')
    }

    const approveCCTVAll = async () => {
        const dataApproveed =  selectedCCTVRows.value.filter(re => re.status != 'ปฏิเสธ' && re.status != 'ปฏิเสธจาก(ทส.)' && re.status != 'อนุมัติ').map(re => re.req_id).join(',')
        
        dataApprove.value.Action = 'อนุมัติ'
        dataApprove.value.ReqID = dataApproveed

        modalAlertApproveAll.value = false
        const res = await postApi('/hd/request/ApproveDocument', dataApprove.value)
        selectedCCTVRows.value = []
        refreshCCTV()
    }

    const approveBorrowAll = async () => {
        const dataApproveed =  selectedBorrowRows.value.filter(re => re.status != 'ปฏิเสธ' && re.status != 'ปฏิเสธจาก(ทส.)' && re.status != 'อนุมัติ' && re.status != 'รอตรวจสอบ(ทส.)').map(re => re.req_id).join(',')
        
        dataApprove.value.Action = 'อนุมัติ'
        dataApprove.value.ReqID = dataApproveed

        modalAlertApproveAll.value = false
        const res = await postApi('/hd/request/ApproveDocument', dataApprove.value)
        selectedBorrowRows.value = []

        refreshBorrow()

    }

    const approveAll = () => {
        if(approveType.value == 'cctv'){
            approveCCTVAll() 
        }
        if(approveType.value == 'repair'){
            approveRepairAll() 
        }
        if(approveType.value == 'borrow'){
            approveBorrowAll() 
        }
    }

    const pageRepair = ref(1)
    const pageRepairCount = ref(20)
    const pageRepairTotal = computed(() => listRepair.value.total)
    const pageRepairFrom = computed(() => (pageRepair.value - 1) * pageRepairCount.value + 1)
    const pageRepairTo = computed(() => Math.min(pageRepair.value * pageRepairCount.value, pageRepairTotal.value))


    
    const { data: listRepair, pending: pendingRepair, refresh: refreshRepair } = await useAsyncData(
        'listRepair',
        async () => {
            const data = await postApi('/hd/request/ListRepair', {
                "SearchText": '',//ค้นหาใน department_desc ,description,phone_req,purpose_desc,item_id,item_name,req_by_fullname ,ค่าว่างค้นหาทั้งหมด  
                "DateBegin": null,//วันที่แจ้งซ่อมเริ่ม
                "DateEnd": null,//ถึงวันที่ซ่อม
                "Username":  auth.username,
                "Status": 'รอตรวจสอบ(ทส.),รออนุมัติ(ทส.)'//รอตรวจสอบ(ทส.),รออนุมัติ(ทส.) 
            })
            return {
                total: data.length,
                data: data.slice((pageRepair.value - 1) * pageRepairCount.value, (pageRepair.value) * pageRepairCount.value)
            }
        }, {
            watch: [pageRepair, pageRepairCount, auth]
        }
    )

    
    const pageBorrow = ref(1)
    const pageBorrowCount = ref(20)
    const pageBorrowTotal = computed(() => listBorrow.value.total)
    const pageBorrowFrom = computed(() => (pageBorrow.value - 1) * pageBorrowCount.value + 1)
    const pageBorrowTo = computed(() => Math.min(pageBorrow.value * pageBorrowCount.value, pageBorrowTotal.value))


    const { data: listBorrow, pending: pendingBorrow, refresh : refreshBorrow } = await useAsyncData(
        'listBorrow',
        async () => {
            const data = await postApi('/hd/request/ListBorrow', {
                "SearchText": '',//ค้นหาใน department_desc ,description,phone_req,purpose_desc,item_id,item_name,req_by_fullname ,ค่าว่างค้นหาทั้งหมด  
                "DateBegin": null,//วันที่แจ้งซ่อมเริ่ม
                "DateEnd": null,//ถึงวันที่ซ่อม
                "Username":  auth.username,
                "Status": 'รอตรวจสอบ(ทส.),รออนุมัติ(ทส.)'//รอตรวจสอบ(ทส.),รออนุมัติ(ทส.) 
            })
            return {
                total: data.length,
                data: data.slice((pageBorrow.value - 1) * pageBorrowCount.value, (pageBorrow.value) * pageBorrowCount.value)
            }
        }, {
            watch: [pageBorrow, pageBorrowCount, auth]
        }
    )

        const pageCCTV = ref(1)
        const pageCCTVCount = ref(20)
        const pageCCTVTotal = computed(() => listCCTV.value.total)
        const pageCCTVFrom = computed(() => (pageCCTV .value - 1) * pageCCTVCount.value + 1)
        const pageCCTVTo = computed(() => Math.min(pageCCTV.value * pageCCTVCount.value, pageCCTVTotal.value))

        const { data: listCCTV, pending: pendingCCTV,  refresh : refreshCCTV } = await useAsyncData(
            'listCCTV',
            async () => {
                const data = await postApi('/hd/request/ListCCTV', {
                    "SearchText": '',//ค้นหาใน department_desc ,description,phone_req,purpose_desc,item_id,item_name,req_by_fullname ,ค่าว่างค้นหาทั้งหมด  
                    "DateBegin": null,//วันที่แจ้งซ่อมเริ่ม
                    "DateEnd": null,//ถึงวันที่ซ่อม
                    "Username":  auth.username,
                    "Status": 'รออนุมัติ(ผอ.ทส.),รอตรวจสอบ(ทส.)'//รอตรวจสอบ(ทส.),รออนุมัติ(ผอ.ทส.) 
                })

                return {
                    total: data.length,
                    data: data.slice((pageCCTV.value - 1) * pageCCTVCount.value, (pageCCTV.value) * pageCCTVCount.value)
                }
            }, {
                watch: [pageCCTV, pageCCTVCount, auth]
            }
        )

</script>

<style lang="scss" scoped>

</style>