const config = useRuntimeConfig();
const myHeaders = new Headers();
myHeaders.append("Content-Type", "application/json");

export const getMasterType = async (type, search) => {
    var raw = JSON.stringify({
        MasterTypeID: type, //อุปกรณ์คอมพิวเตอร์
        SearchText: search, //ค้นหาใน MasterTypeID ,Description1 ,Description2 ,ค่าว่างค้นหาทั้งหมด
        ShowSelectAll: false, //แสดงตัวเลือก "ทั้งหมด"
    });

    var requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
    };

    try {
        const response = await fetch(
            `${config.public.apiUrl}/MasterType/ListData`,
            requestOptions
        );
        return await response.json();
    } catch (error) {
        return error;
    }
};

export const getListItems = async (search, status, type = '', cate = '') => {
    var raw = JSON.stringify({
        SearchText: search, //ค้นหาใน cate_name ,description ,ค่าว่างค้นหาทั้งหมด
        Type: type, //ประเภท ส่งค่าจาก dropdown  ที่มากจาก masterTypeID =HD_ITEMTYPE
        Cate: cate, //ประเภท ส่งค่าจาก dropdown  ที่มากจาก masterTypeID =HD_ITEMTYPE

        Status: status, //ว่าง , ไม่ว่าง , ส่งซ่อม ,ใช้งานไม่ได้ ค่าว่างแสดงทั้งหมด ใส่ได้หลายค่าคั่นด้วย ","
    });

    var requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
    };

    try {
        const response = await fetch(
            `${config.public.apiUrl}/hd/Items/ListData`,
            requestOptions
        );
        return await response.json();
    } catch (error) {
        return error;
    }
};


export const getListCCTV = async (search, dataBegin, dateEnd, status) => {
    var raw = JSON.stringify({
        SearchText: search, //ค้นหาใน department_desc ,description,phone_req,purpose_desc,item_id,item_name,req_by_fullname ,ค่าว่างค้นหาทั้งหมด
        DateBegin: dataBegin, //วันที่แจ้งซ่อมเริ่ม
        DateEnd: dateEnd, //ถึงวันที่ซ่อม
        Status: status, //รอตรวจสอบ(ทส.),รออนุมัติ(ทส.)
    });

    var requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
    };

    try {
        const response = await fetch(
            `${config.public.apiUrl}/hd/request/ListCCTV`,
            requestOptions
        );
        return await response.json();
    } catch (error) {
        return error;
    }
};


export const addMasterType = async (data) => {
    var raw = JSON.stringify(data);

    var requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
    };

    try {
        const response = await fetch(
            `${config.public.apiUrl}/MasterType/Add`,
            requestOptions
        );
        return await response.json();
    } catch (error) {
        return error;
    }
};


export const deleteMasterType = async (data) => {
    var raw = JSON.stringify(data);

    var requestOptions = {
        method: "DELETE",
        headers: myHeaders,
        body: raw,
    };

    try {
        const response = await fetch(
            `${config.public.apiUrl}/MasterType/Delete`,
            requestOptions
        );
        return await response.json();
    } catch (error) {
        return error;
    }
};

export const searchUserApi = async (search) => {
    var raw = JSON.stringify({
        Search: search,
    });

    var requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
    };

    try {
        const response = await fetch(
            `${config.public.apiUrl}/Person/ListUserInfo`,
            requestOptions
        );
        return await response.json();
    } catch (error) {
        return error;
    }
};
export const postApi = async (url, data) => {
    var raw = JSON.stringify(data);

    var requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
    };

    try {
        const response = await fetch(
            `${config.public.apiUrl}${url}`,
            requestOptions
        );
        return await response.json();
    } catch (error) {
        return error;
    }
};

export const getApi = async (url) => {
    try {
        const response = await fetch(`${config.public.apiUrl}${url}`);
        return await response.json();
    } catch (error) {
        return error;
    }
};


export const deleteApi = async (url, data) => {
    var raw = JSON.stringify(data);

    var requestOptions = {
        method: "DELETE",
        headers: myHeaders,
        body: raw,
    };

    try {
        const response = await fetch(
            `${config.public.apiUrl}${url}`,
            requestOptions
        );
        return await response.json();
    } catch (error) {
        return error;
    }
};


export const deleteRequestApi = async (id) => {
    var raw = JSON.stringify({
        ReqID: id, //รหัสคำขอ
        ActiondBy: "tammon.y", //current user login
    });

    var requestOptions = {
        method: "DELETE",
        headers: myHeaders,
        body: raw,
    };

    try {
        const response = await fetch(
            `${config.public.apiUrl}/hd/request/DeleteDoc`,
            requestOptions
        );
        return await response.json();
    } catch (error) {
        return error;
    }
};