document.addEventListener("DOMContentLoaded", async()=>{


    const token = localStorage.getItem("token");


    if(!token){

        window.location.replace("../public/login.html");

        return;

    }



    const params = new URLSearchParams(
        window.location.search
    );


    const staffId = params.get("id");



    if(!staffId){

        alert("Invalid staff ID");

        window.location.href="admin-staff.html";

        return;

    }



    document
    .getElementById("app")
    .style.display="block";



    loadStaff();



    async function loadStaff(){


        const response = await fetch(

            `/api/admin/groomers/${staffId}`,

            {

                headers:{

                    Authorization:
                    "Bearer " + token

                }

            }

        );



        const staff =
        await response.json();




        if(!response.ok){

            alert(staff.message);

            return;

        }





        document.getElementById("first_name").value =
        staff.first_name;



        document.getElementById("last_name").value =
        staff.last_name;



        document.getElementById("email").value =
        staff.email ?? "";



        document.getElementById("phone_number").value =
        staff.phone_number;



        document.getElementById("specialization").value =
        staff.specialization;



        document.getElementById("hire_date").value =
        staff.hire_date.substring(0,10);


    }







    document
    .getElementById("staffEditForm")
    .addEventListener("submit",async(e)=>{


        e.preventDefault();



        const updatedStaff = {


            first_name:
            document.getElementById("first_name").value.trim(),


            last_name:
            document.getElementById("last_name").value.trim(),


            email:
            document.getElementById("email").value.trim(),


            phone_number:
            document.getElementById("phone_number").value.trim(),


            specialization:
            document.getElementById("specialization").value.trim(),


            hire_date:
            document.getElementById("hire_date").value


        };





        const response = await fetch(

            `/api/admin/groomers/${staffId}`,

            {

                method:"PUT",

                headers:{

                    "Content-Type":
                    "application/json",

                    Authorization:
                    "Bearer " + token

                },


                body:
                JSON.stringify(updatedStaff)

            }

        );




        const data =
        await response.json();




        if(response.ok){


            alert("Groomer updated successfully");


            window.location.href=
            "admin-staff.html";


        }
        else{


            alert(
                data.message ||
                "Update failed"
            );


        }



    });






    document
    .getElementById("logoutBtn")
    .addEventListener("click",(e)=>{


        e.preventDefault();


        localStorage.removeItem("token");


        window.location.href=
        "../public/login.html";


    });



});