<template>
</template>

<script setup>


definePageMeta({ 
    layout: 'redirect',
})

    const route = useRoute()
    const config = useRuntimeConfig();

    const url = `${config.public.authUrl}/api/AppsLogin/GetCrossAppReq?request=${route.params.id}`;
    const authStore = useAuthStore();


    const loginForm = ref({
        username: "",
        password: "",
        AppsID: "E-Learning"
    })

    const login = () =>{
        authStore.login(JSON.stringify(loginForm.value))
            .then((_response) => useRouter().push('/'))
            .catch((error) => {
                console.log(error);
                waitingLogin.value = false
                messageError.value = error
            })
    }

    onMounted(async () =>{
        const res = await fetch(`${url}`)
        const data = await res.json()

        loginForm.value.username = data.userName
        loginForm.value.password = data.reqID

        login()
       

    })

      

    // const url = `${config.public.authUrl}/api/AppsLogin/CreateCrossAppReq`

    // var raw = JSON.stringify({
    //     UserName:"tammon.y",
    //     Apps:"E-LEARNING"
    // });
    // var requestOptions = {
    //     method: 'POST',
    //     headers: {
    //         "Content-Type": "application/json; charset=UTF-8",
    //     },
    //     body: raw,
    // };

    // fetch(url, requestOptions)
    //     .then(response => response.json())
    //     .then( json => {
    //         typeSubjectCourses.value = json
    //     })
    //     .catch(error => console.log('error', error));
  
    
        
</script>