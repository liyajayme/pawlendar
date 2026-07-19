document.addEventListener("DOMContentLoaded", () => {


    const token = localStorage.getItem("token");


    if (!token) {

        window.location.replace("../public/login.html");

        return;

    }





    const form = document.getElementById("staffForm");



    form.addEventListener("submit", async (e) => {


        e.preventDefault();




        const groomer = {


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






        try {



            const response = await fetch(

                "/api/admin/groomers",

                {


                    method:"POST",


                    headers:{


                        "Content-Type":"application/json",


                        Authorization:`Bearer ${token}`


                    },


                    body:JSON.stringify(groomer)


                }

            );







            const data = await response.json();







            if(response.ok){



                alert("Groomer added successfully!");



                form.reset();




                window.location.href = "admin-staff.html";



            }


            else{



                alert(

                    data.message ||

                    "Failed to create groomer"

                );



            }





        }


        catch(err){



            console.error(err);



            alert("Server connection failed.");



        }




    });








    const logoutBtn = document.getElementById("logoutBtn");



    logoutBtn.addEventListener("click", (e) => {



        e.preventDefault();




        const confirmed = confirm(

            "Are you sure you want to log out?"

        );



        if (!confirmed) return;





        localStorage.removeItem("token");

        localStorage.removeItem("owner");

        localStorage.removeItem("admin");





        window.location.href = "../public/login.html";



    });



});