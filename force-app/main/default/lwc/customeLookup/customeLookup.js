import { LightningElement, api, track } from 'lwc';
import returnAllRelatedObjNames from '@salesforce/apex/CustomLookup.returnAllRelatedObjNames';
import returnAllRelatedObjFields from '@salesforce/apex/CustomLookup.returnAllRelatedObjFields';
import queryObjectDat from '@salesforce/apex/CustomLookup.queryObjectData';

export default class CustomeLookup extends LightningElement {

    @api objectApiName;

    connectedCallback() {
        this.returnAllRelatedObject();
    }


    @track StoreAllRelatedObjects = [];


    returnAllRelatedObject() {
        returnAllRelatedObjNames({ ObjectName: this.objectApiName })
            .then((result) => {
                this.StoreAllRelatedObjects = result;
                console.log(result);
            }).catch((error) => {

            });
    }

    @track isShowModal = false;
    @track StoreAllObjectFields = [];


    @track objName = 'Contact';

    handleClickOfSelectFields(event) {

        // this.objName =event.currentTarget.dataset.Name;

        this.isShowModal = true;

        returnAllRelatedObjFields({ ObjectName: this.objName })
            .then((result) => {
                this.StoreAllObjectFields = result.map(field => ({ label: field, value: field }));
            })
            .catch((error) => {
                console.error(error);
            });
    }

    handleClickOfCloseModal() {
        this.isShowModal = false;
    }


    @track selectedOptionsList = [];


    @track columns=[];

    handleChangeOfSelectedFields(event) {
        this.selectedOptionsList = event.detail.value;

        this.columns = this.selectedOptionsList.map(field => ({ label: field, value: field }));

        console.log(`Options selected: ${this.selectedOptionsList}`);
        console.log(this.objName);

        
    }



    @track StoreAllRecordsData = [];

    handleClickOfOk() {
        queryObjectDat({ objectName: this.objName, fields: this.selectedOptionsList })
            .then((result) => {
                console.log(result);
                this.isShowModal = false;

this.StoreAllRecordsData =result

                // Display transformed data
                console.log(transformedData);
            }).catch((error) => {
                console.log(error.body.message);
            });

    }



}
