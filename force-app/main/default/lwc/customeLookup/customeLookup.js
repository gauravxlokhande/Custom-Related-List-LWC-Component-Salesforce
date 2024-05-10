import { LightningElement, api, track, wire } from 'lwc';
import returnAllRelatedObjFields from '@salesforce/apex/CustomLookup.returnAllRelatedObjFields';
import queryObjectData from '@salesforce/apex/CustomLookup.queryObjectData';
import { getRecord, createRecord, updateRecord, deleteRecord, getRecordUi, getFieldValue, getFieldDisplayValue, getRecordCreateDefaults, createRecordInputFilteredByEditedFields, generateRecordInputForCreate, generateRecordInputForUpdate } from 'lightning/uiRecordApi';

import { getObjectInfo } from 'lightning/uiObjectInfoApi';


const actions = [
    { label: 'Edit', name: 'edit' },
    { label: 'Delete', name: 'delete' },
    { label: 'View', name: 'view' },
];


export default class CustomeLookup extends LightningElement {

    @api objectApiName = '';
    @api recordId = '';


    @track options = [];
    @track RelatedObjectData = [];
    @track isShowModal = false;
    @track StoreRelatedField = '';
    @track StoreAllObjectFields = [];
    @track selectedFinalFields = [];
    @track RecordLength = '';



    @wire(getObjectInfo, { objectApiName: '$objectApiName' })
    wiredObjectInfo({ error, data }) {
        if (data) {
            this.options = data.childRelationships.map(relationship => ({ value: relationship.childObjectApiName, label: relationship.childObjectApiName }));
            this.RelatedObjectData = data;
            // console.log('parentObjectOptions',JSON.stringify(data));
        } else if (error) {
            console.error('Error fetching object info:', error);
        }
    }


    handleChange(event) {
        this.SelectedObject = event.detail.value;

        const selectedRelationship = this.RelatedObjectData.childRelationships.find(
            relationship => relationship.childObjectApiName === this.SelectedObject
        );
        if (selectedRelationship) {
            this.StoreRelatedField = selectedRelationship.fieldName;
            console.log('Template Object Name:', this.SelectedObject);
            console.log('Related Field Name:', this.StoreRelatedField);
        } else {

            this.StoreRelatedField = '';
            console.log('No child relationship found for:', this.SelectedObject);
        }
    }



    handleClickOfSelectFields() {
        this.FetchAllObjectFields();
        this.isShowModal = true;
    }


    FetchAllObjectFields() {
        returnAllRelatedObjFields({ ObjectName: this.SelectedObject })
            .then((result) => {
                this.StoreAllObjectFields = result
                    .filter(field => !field.includes('Id'))
                    .map(field => ({ label: field, value: field }));
                console.log('Template Object Fields::', JSON.stringify(this.StoreAllObjectFields));
            })
            .catch((error) => {
                console.error(error);
            });
    }


    handleChangeOfSelectedFields(event) {
        this.selectedFinalFields = event.detail.value;
        console.log(this.selectedFinalFields);
    }


    handleClickOfOk() {
        const actionColumn = {
            type: 'action',
            typeAttributes: { rowActions: actions }, 
        };
        const fieldColumns = this.selectedFinalFields.map(field => ({ label: field, fieldName: field }));
        this.columns = [...fieldColumns, actionColumn];
        this.FetchallobjectData();
        this.isShowModal = true;
    }
    


    FetchallobjectData() {
        console.log('Template Object Name:', this.SelectedObject);
        console.log('Related Field Name:', this.StoreRelatedField);
        console.log('Related Field Name:', this.selectedFinalFields);

        queryObjectData({ objectName: this.SelectedObject, fields: this.selectedFinalFields, RelatedField: this.StoreRelatedField, CurrentObjectId: this.recordId })
            .then((result) => {
                this.isShowModal = false;
                this.StoreAllRecordsData = result;
                this.RecordLength = this.StoreAllRecordsData.length;
                console.log('Selected Object records:', JSON.stringify(result));
            }).catch((error) => {
                console.error(error.body.message);
            });
    }


    handleClickOfCloseModal() {
        this.isShowModal = false;
    }


    @track SearchValue = '';

    HandleSearchRecords(event) {
        this.SearchValue = event.target.value;
        console.log('searchvalue', this.SearchValue);
        if (this.SearchValue.length > 1) {
            this.StoreAllRecordsData = this.StoreAllRecordsData.filter(item => {
                return this.selectedFinalFields.some(element => {
                    return item[element] && item[element].toLowerCase().includes(this.SearchValue.toLowerCase());
                });
            });
        } else if (this.SearchValue.length <= 1) {
            this.FetchallobjectData();
        }
    }



    handleRowAction(event) {
        const action = event.detail.action.name;
        const row = event.detail.row;

        console.log(row);
        console.log(action);
        switch (action) {
            case 'edit':
                // Handle the edit action
                break;
            case 'delete':
                // Handle the delete action
                break;
            case 'view':
                // Handle the view action
                break;
            default:
                break;
        }
    }





}
