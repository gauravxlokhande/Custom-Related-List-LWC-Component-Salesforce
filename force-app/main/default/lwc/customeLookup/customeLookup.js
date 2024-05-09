import { LightningElement, api, track,wire } from 'lwc';
import returnAllRelatedObjNames from '@salesforce/apex/CustomLookup.returnAllRelatedObjNames';
import returnAllRelatedObjFields from '@salesforce/apex/CustomLookup.returnAllRelatedObjFields';
import queryObjectData from '@salesforce/apex/CustomLookup.queryObjectData';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { getRecord, createRecord, updateRecord, deleteRecord, getRecordUi, getFieldValue, getFieldDisplayValue, getRecordCreateDefaults, createRecordInputFilteredByEditedFields, generateRecordInputForCreate, generateRecordInputForUpdate } from 'lightning/uiRecordApi';
import { NavigationMixin } from 'lightning/navigation';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';


export default class CustomeLookup extends NavigationMixin(LightningElement) {
    @api objectApiName='';
    @track StoreAllRelatedObjects = [];
    @track isShowModal = false;
    @track StoreAllObjectFields = [];
    @track selectedOptionsList = [];
    @track columns = [];
    @track StoreAllRecordsData = [];
    @track options = [];
    @track Objectname = '';

    connectedCallback() {
        this.returnAllRelatedObject();
        console.log('Current Object Name::', this.objectApiName);
    }

    async returnAllRelatedObject() {
        await returnAllRelatedObjNames({ ObjectName: this.objectApiName })
            .then((result) => {
                this.options = result.map(field => ({ label: field, value: field }));
                console.log('Current Object Related Objects Names::', JSON.stringify(this.StoreAllRelatedObjects));
            }).catch((error) => {
                console.error(error);
            });
    }


    async handleChange(event) {
        this.Objectname = event.detail.value;

        console.log('Template Object Name::', this.Objectname);

        await returnAllRelatedObjFields({ ObjectName: this.Objectname })
            .then((result) => {
                this.StoreAllObjectFields = result.map(field => ({ label: field, value: field }));
                console.log('Template Object Fields::', JSON.stringify(this.StoreAllObjectFields));
            })
            .catch((error) => {
                console.error(error);
            });
    }




    handleClickOfSelectFields() {
        this.isShowModal = true;
    }

    handleClickOfCloseModal() {
        this.isShowModal = false;
    }

    handleChangeOfSelectedFields(event) {
        this.selectedOptionsList = event.detail.value;
        console.log('Selected Object Fields:', this.selectedOptionsList);
    }


    handleClickOfOk() {
        this.columns = this.selectedOptionsList.map(field => ({ label: field, fieldName: field }));
        this.FetchallobjectData();
    }

    FetchallobjectData() {
        console.log('Objname', this.Objectname);
        console.log('Optionslist', JSON.stringify(this.selectedOptionsList));
        queryObjectData({ objectName: this.Objectname, fields: this.selectedOptionsList })
            .then((result) => {
                this.isShowModal = false;
                this.StoreAllRecordsData = result;
                console.log('Selected Object records:', JSON.stringify(result));
            }).catch((error) => {
                console.error(error.body.message);
            });
    }


    @track SearchValue = '';

    HandleSearchRecords(event) {
        this.SearchValue = event.target.value;
        console.log('searchvalue', this.SearchValue);
        if (this.SearchValue.length > 1) {
            this.StoreAllRecordsData = this.StoreAllRecordsData.filter(item => {
                return this.selectedOptionsList.some(element => {
                    return item[element] && item[element].toLowerCase().includes(this.SearchValue.toLowerCase());
                });
            });
        } else {
            this.FetchallobjectData();
        }
    }
    






    handleRowAction(event) {
        const selectedRow = event.detail.row;
        // Perform action on selected row
        console.log('Selected Row:', selectedRow);
        // Example: Navigate to record detail page
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: selectedRow.Id,
                actionName: 'view'
            }
        });
    }








   

}
