# Version 1.0.0 (2023-11-XX)

## Version 1.0.0-alpha.3 (2023-12-18)

### Features

- สามารถอนุมัติคำขอดู CCTV ได้หลายรายการในครั้งเดียว ([DH-27](https://ck-consulting.atlassian.net/browse/DH-27)) 
  
### Improves performance

- แก้ไขชื่อปุ่ม คืนสินค้า เป็น คืนพัสดุ ([DH-68](https://ck-consulting.atlassian.net/browse/DH-68)) 

### Fix bugs
- ไม่สามารถเลือก กรณีอื่นๆ ในคำขอดู CCTV ได้ ([DH-64](https://ck-consulting.atlassian.net/browse/DH-64)) 
- แก้ไขรายการแจ้งซ่อมแล้ว ชื่อหน่วยงานไม่ขึ้น ([DH-65](https://ck-consulting.atlassian.net/browse/DH-65)) 
- ในหน้าฟอร์มรายการยืม-คืนพัสดุ เมื่อเพิ่มรายการอุปกรณ์ที่ต้องการยืม แต่ไม่มีปุ่มให้ลบรายการออก ([DH-66](https://ck-consulting.atlassian.net/browse/DH-66)) 
- แก้ไขรายการยืม-คืนพัสดุแล้ว ชื่อหน่วยงานไม่ขึ้น ([DH-67](https://ck-consulting.atlassian.net/browse/DH-67)) 
- คืนพัสดุ กรอกเกินจำนวนได้ ([DH-69](https://ck-consulting.atlassian.net/browse/DH-69)) 


## Version 1.0.0-alpha.2 (2023-12-02)

### Features
- สามารถอนุมัติรายการคืนพัสดุที่ยืมได้ ([DH-42](https://ck-consulting.atlassian.net/browse/DH-42)) 
- สามารถอนุมัติรายการยืมได้ (user สร้าง -> ผอ.หน่วยอนุมัติ -> ทส.จัดหาให้ยืม) ([DH-44](https://ck-consulting.atlassian.net/browse/DH-44)) 
- สามารถติดตามรายการคงค้างได้ ([DH-43](https://ck-consulting.atlassian.net/browse/DH-43)) 
- การอนุมัติคำขอดู CCTV จะเป็น 2 ขั้นคือ (user สร้างคำขอ -> ทส. ตรวจสอบ -> ผอ. อนุมัติ) ([DH-28](https://ck-consulting.atlassian.net/browse/DH-28)) 
- สามารถอนุมัติคำขอดู CCTV ได้ (หากไม่อนุมัติต้องระบเหตุผล) ([DH-26](https://ck-consulting.atlassian.net/browse/DH-26)) 
- สามารถอนุมัติรายการแจ้งซ่อมได้ (user สร้างคำขอ -> ผอ.หน่วยอนุมัติ -> ทส. จัดการส่งต่อให้บริษัทซ่อม) ([DH-35](https://ck-consulting.atlassian.net/browse/DH-35)) 

### Fix bugs
- ไม่สามารถเพิ่มวัตถุประสงค์การแจ้งซ่อมได้ (เพิ่มแล้วทับรายการเดิมที่มีอยู่) ([DH-48](https://ck-consulting.atlassian.net/browse/DH-48)) 
- หน้าจัดการคลังอุปกรณ์ เมื่อเพิ่ม/แก้ ใส่ข้อมูลใน "รุ่น" แต่ข้อมูลไปโผลที่ "จำนวน" ด้วย ([DH-49](https://ck-consulting.atlassian.net/browse/DH-49)) 
- แก้ไขคลังอุปกรณ์ ในส่วนของการรับประกัน เมื่อบันทึกแล้ว ข้อมูลไม่เปลี่ยนแปลง ([DH-50](https://ck-consulting.atlassian.net/browse/DH-50)) 
- แก้ไขคำขอดู CCTV ใส่กรณีแล้ว หายทุกครั้งที่บันทึก (เมื่อกลับไปดู) ([DH-52](https://ck-consulting.atlassian.net/browse/DH-52)) 
- กรณีใน CCTV ในหน้าฟอร์ม ไม่ตรงกับกรณีของ CCTV ในหน้าตั้งค่า ([DH-53](https://ck-consulting.atlassian.net/browse/DH-53)) 
- แก้ไขรายการแจ้งซ่อมไม่ได้ บันทึกแล้วข้อมูลก็ยังเป็นข้อมูลเดิมอยู่ ([DH-55](https://ck-consulting.atlassian.net/browse/DH-55)) 
- ลบรายการแจ้งซ่อมไม่ได้ ([DH-56](https://ck-consulting.atlassian.net/browse/DH-56))
- ในหน้าฟอร์มรายการยืม-คืนพัสดุ เมื่อเพิ่มรายการอุปกรณ์ที่ต้องการยืม แต่ไม่มีปุ่มให้ลบรายการออก ([DH-57](https://ck-consulting.atlassian.net/browse/DH-57))
- แก้ไขข้อมูลรายการยืม-คืนพัสดุ เมื่อแก้เบอร์โทรศัพท์แล้วบันทึก ในหน้ารายการไม่แก้ตาม แต่เข้าไปดูข้อมูลข้างในก็แก้ตามแล้ว ([DH-59](https://ck-consulting.atlassian.net/browse/DH-59))
- ยืม-คืนพัสดุ คืนไม่ได้ เมื่อกดคืน->กรอกจำนวนคืน แล้วกดปุ่มแจ้งคืนพัสดุ มันมีหน้าขึ้นมาให้กรอกเพิ่มอีกที ([DH-60](https://ck-consulting.atlassian.net/browse/DH-60))
- ถ้าไม่อนุมัติการขอ CCTV แล้วกรอกเหตุผลแล้ว เวลาดูรายละเอียดจะไม่มีเหตุผลไม่ดู ([DH-61](https://ck-consulting.atlassian.net/browse/DH-61))
- รายการคำขอดู CCTV ไม่สามารถกำหนดวันที่ได้ ([DH-63](https://ck-consulting.atlassian.net/browse/DH-63))

## Version 1.0.0-alpha.1 (2023-11-17)

### Features
- Add all features in Sprint 1 ([DH-45](https://ck-consulting.atlassian.net/browse/DH-45)) 