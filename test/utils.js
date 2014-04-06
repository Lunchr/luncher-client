function pruneObject(obj){
  for (var prop in obj) {
    if (obj.hasOwnProperty(prop)){
      delete obj[prop];
    }
  }
}
