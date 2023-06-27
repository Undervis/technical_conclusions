let mainApp = new Vue({
    el: "#mainApp",
    data: {
        tcObjectsList: [],
        tcObject: {
            tc_id: "", tc_date: "", tc_organisation: "",
            object_name: "", object_inventory_id: "", object_creation_id: "", object_creation_year: "",
            object_start_using: "", object_fix_count: "Не учитывалось", object_troubles: "",
            object_reason: "В связи с эксплуатацией и наличием неисправностей объект утратил эксплуатационные характеристики и не может использоваться по назначению.",
            object_reuse_info: "Дальнейшее использование в связи с имеющимися неисправностями невозможно.",
            object_reuse_mats_info: "Пригодные для дальнейшего использования части и материалы отсутствуют.",
            object_metals_info: "Техническая документация на прибор не содержит сведений о содержании в объекте цветных драгоценных или редкоземельных \n" +
                "металлов, их наличие будет определено после списания и утилизации.",
            object_danger_info: "Не содержит веществ, свойств, частей, потенциально опасных для человека.",
            object_conclusion: "В связи с выявленными неисправностями оборудование к дальнейшему использованию \n" +
                "непригодно. Дефекты являются значительными, восстановление и проведение ремонтно-восстановительных работ экономически \n" +
                "нецелесообразно. Рекомендуется списать."
        },
        newTcObject: {},
        isSaved: true,
        isNew: true,
        errTitle: "",
        errMsg: ""
    },
    created: function () {
        this.getTCList()
        this.newTcObject = _.clone(this.tcObject)
    },
    watch: {
        tcObject: {
            deep: true,
            handler: function (oldValue, newValue) {
                this.isSaved = false
            }
        }
    },
    methods: {
        showPopUp: function (title, msg) {
            const toastLiveExample = document.getElementById('liveToast')
            const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toastLiveExample)
            this.errTitle = title
            this.errMsg = msg
            toastBootstrap.show()
        },
        getTCList: function () {
            axios.get("/api/tech_conclusion")
                .then((response) => {
                    this.tcObjectsList = response.data
                })
                .catch((error) => {
                    alert(error)
                })
        },
        saveTC: function () {
            axios.post("/api/tech_conclusion/", this.tcObject, {'headers': {'Content-Type': 'multipart/form-data'}})
                .then((response) => {
                    console.log(response.data)
                    this.isSaved = true
                    this.isNew = false
                    this.getTCList()
                    this.showPopUp("Отлично", "Заключение сохранено")
                })
                .catch((error) => {
                    console.log(error)
                    if (error.code === "ERR_BAD_REQUEST") {
                        this.showPopUp("Ошибка!", "Не все поля заполнены!")
                    }
                })
        },
        replaceTC: function (newTC) {
            if (this.isSaved === false) {
                let result = confirm("Запись не сохранена, вы действительно хотите выбрать другое Техническое Заключение?")
                if (result) {
                    this.tcObject = _.clone(newTC)
                    setTimeout(function () {
                        mainApp.isSaved = true
                        mainApp.isNew = false
                    }, 200)
                }
            } else {
                this.tcObject = _.clone(newTC)
                setTimeout(function () {
                    mainApp.isSaved = true
                    mainApp.isNew = false
                }, 200)
            }
        },
        deleteTC: function () {
            if (this.isSaved) {
                let result = confirm("Вы действительно хотите удалить это заключение?")
                if (result) {
                    axios.delete("/api/tech_conclusion/?tc_id=" + this.tcObject.tc_id)
                        .then((response) => {
                            console.log(response)
                            this.showPopUp("Успешно", "Заключение удалено")
                            this.getTCList()
                            this.newTC()
                        })
                        .catch((error) => {
                            console.log(error)
                            this.showPopUp("Ошибка!", "Не удалось удалить запись")
                        })
                }
            }
        },
        newTC: function () {
            if (!this.isSaved) {
                let result = confirm("Запись не сохранена, вы действительно хотите выбрать другое Техническое Заключение?")
                if (result) {
                    this.tcObject = this.newTcObject
                    setTimeout(function () {
                        mainApp.isSaved = true
                        mainApp.isNew = true
                    }, 200)
                }
            } else {
                this.tcObject = this.newTcObject
                setTimeout(function () {
                    mainApp.isSaved = true
                    mainApp.isNew = true
                }, 200)
            }
        },
        downloadTC: function () {
            // Выполнение запроса на скачивание файла с передачей объекта в качестве параметров запроса
            axios.get('/download_file', {params: this.tcObject, responseType: 'blob'})
                .then((response) => {
                    const href = URL.createObjectURL(response.data)
                    // при успешном выполнении запроса, создается временный элемент с сылкой
                    const link = document.createElement('a');
                    link.href = href;
                    link.setAttribute('download',
                        this.tcObject.tc_id + " - " + this.tcObject.object_name + '.docx');
                    document.body.appendChild(link);
                    // автоматический клик на ссылку и скачивание
                    link.click();
                    // после скачивания файла, элемент удаляется
                    document.body.removeChild(link);
                    URL.revokeObjectURL(href);
                    console.log(response)
                })
                .catch((error) => {
                    console.log(error)
                })
        }
    }
})