public with sharing class CustomLookup {
    

    
    @AuraEnabled
    public static List<String> returnAllRelatedObjNames(String ObjectName) { 
        
        Schema.DescribeSObjectResult objectDescribe = Schema.getGlobalDescribe().get(ObjectName).getDescribe();
        List<Schema.ChildRelationship> childRelationships = objectDescribe.getChildRelationships();
        
        List<String> objectNames = new List<String>();
        for(Schema.ChildRelationship childRelation : childRelationships) {
            Schema.DescribeSObjectResult childDescribe = childRelation.getChildSObject().getDescribe();
            objectNames.add(childDescribe.getName());
        }
        
        System.debug('All objects names: ' + objectNames);
        return objectNames;
    }
   

     @AuraEnabled
    public static List<String> returnAllRelatedObjFields( String ObjectName){
        
        List<String> StoreallFields =new List<String>(); 
        
        Map <String,Schema.SObjectType> gd = Schema.getGlobalDescribe();
        Schema.SObjectType sobjType = gd.get(ObjectName);
        Schema.DescribeSObjectResult r = sobjType.getDescribe();
        Map<String, Schema.SObjectField> MapofField = r.fields.getMap();
        for(String fieldName : MapofField.keySet()) 
        {
            Schema.SObjectField field = MapofField.get(fieldName);
            Schema.DescribeFieldResult F = field.getDescribe();
            System.debug('Field Name: '+F.getName()); 
            StoreallFields.add(F.getName());
        }
        return StoreallFields;
    }
    

    
    

    @AuraEnabled
    public static List<Map<String, Object>> queryObjectData(String objectName, List<String> fields) {
        String queryString = 'SELECT ';
        
        for (String field : fields) {
            queryString += field + ', ';
        }
        queryString = queryString.removeEnd(', '); 
        
        queryString += ' FROM ' + objectName+ ' Limit '+' 5 ';
        
        List<Map<String, Object>> results = new List<Map<String, Object>>();
        try {
            List<SObject> queriedRecords = Database.query(queryString);
            
            for (SObject record : queriedRecords) {
                Map<String, Object> recordMap = new Map<String, Object>();
                for (String field : fields) {
                    recordMap.put(field, record.get(field));
                }
                results.add(recordMap);
            }
        } catch (Exception e) {
            System.debug('Error querying data: ' + e.getMessage());
        }
        System.debug(results);
        return results;
    }


    
}