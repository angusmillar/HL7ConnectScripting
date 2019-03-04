/*****************************************************************************
 SQL Server Database functions
 *****************************************************************************/

// function : ReadEpisode
// purpose  : Reads PLSData Episode table given a PLS request/Episode Number
//            Assumptions - EpeNum is the full PLS Episode Request Number (12A123456)
// return   : the episode object or null or base default data to use
function ReadPLSEpeDetail(epenum)
{
  var epe = new episode(epenum,"","","","");
  var dbName = "PLSData";
  var db = Kernel.GetDB(dbName);
  var con = db.GetConnection(dbName);
  con.SQL = "SELECT tblPLS_Epe.* FROM tblPLS_Epe WHERE (tblPLS_Epe.txtEpiNum) = '"+epenum+"'";
  con.Prepare;
  con.Execute;
  if (con.FetchNext) //'Select record if found.
  {
    //alert("Pat found so Processing data from Database");
    epe.patnum = con.ColStringByName("txtPatNum");
    epe.requestdate = con.ColStringByName("dtmColDate");
    epe.requrno = con.ColStringByName("txtUrno");
    epe.testcode = con.ColStringByName("txtTests");
  }
  else
  {
    //epe = null;
    //alert("Pat not found so Processing data from Database using defaults");
    epe.patnum = "";
    epe.requestdate = "1899-01-01";
    epe.requrno = "";
    epe.testcode = "";
  }
  con.terminate;
  //Kernel.WriteToLog(DBG_ERROR, 'ReadEpisode: DB connection terminated');
  db.YieldConnection(con,'');
  return(epe);
}

// function : ReadPatient
// purpose  : Reads PLSData Patient table given a Patient Key number
// return   : the patient object or null or base default data to use
function ReadPLSPatDetail(patnum,dtype)
{
  var arrPat = new Array(patnum,"","","","","","","","","","","");
  var pat = new patient(arrPat);
  var dbName = "PLSData";
  var db = Kernel.GetDB(dbName);
  var con = db.GetConnection(dbName);
  con.SQL = "SELECT tblPLS_Pat.* FROM tblPLS_Pat WHERE (tblPLS_Pat.txtPatNum) = '"+patnum+"'";
  con.Prepare;
  con.Execute;
  if (con.FetchNext) //'Select record if found.
  {
    //alert("Pat found so Processing data from Database");
    pat.surname = con.ColStringByName("txtSurname");
    pat.givenName = con.ColStringByName("txtGiven");
    pat.sex = con.ColStringByName("txtSex");
    pat.dob = con.ColStringByName("dtmDOB");
    pat.oDob = con.ColDateAndTimeByName("dtmDOB");
    pat.address1 = con.ColStringByName("txtAddress1");
    pat.address2 = con.ColStringByName("txtAddress2");
    pat.city = con.ColStringByName("txtSuburb");
    pat.postcode = con.ColStringByName("txtPCode");
    pat.fnd = "DBPatient";
  }
  else
  {
    //pat = null;
    //alert("Pat not found so Processing data from Database using defaults");
    pat.surname = "Kestral";
    pat.givenName = dtype;
    pat.sex = "U";
    pat.dob = "1899-01-01";
    pat.address1 = "Mater Labaoratory";
    pat.address2 = "Stanley Street South Brisbane";
    pat.city = "SOUTH BRISBANE";
    pat.postcode = "4101";
    pat.fnd = "DefaultPatient";
  }
  con.terminate;
  //Kernel.WriteToLog(DBG_ERROR, 'ReadPatient: DB connection terminated');
  db.YieldConnection(con,'');
  return(pat);
}

// class   : patient
// purpose : Constructer for Patient fields
function patient(arPat)
{
  this.patnum = arPat[0];
  this.surname = arPat[1];
  this.givenName = arPat[2];
  this.sex = arPat[3];
  this.dob = arPat[4];            // Birthdate
  this.oDob = arPat[5];           // oBirthdate
  this.address1 = arPat[6];
  this.address2 = arPat[7];
  this.city = arPat[8];
  this.postcode = arPat[9];
  this.fnd = arPat[10];
}

// class   : episode
// purpose : Constructer for Episode fields
function episode(EpeNum,TestCode,RequestDate,ReqUrno,PatNum)
{
  this.epenum = EpeNum;           // Request Number
  this.testnode = TestCode;       // test code - use instrument code
  this.requestdate = RequestDate; // Date requested
  this.requrno = ReqUrno;         // Unit Record no for this episode.
  this.patnum = PatNum;           // patient key
}

// function : ProcSQLData
// purpose  : Process an SQL statement to SQL
//            based on the KScript ORC status indicator
// return   : null
//function ProcSQLData(dbase,tbl,wList,fieldList,resultList,updateList,HL7Data,deleteRecords)
function ProcSQLData(dbase,tbl,HL7Data,wList,fieldList,resultList,updateList,OrderStatus,deleteRecords)
{
  alert("ProcSQLData Database issue: " + tbl);
  var err = 0;
  var db = Kernel.GetDB(dbase);          //' get a handle to the global database pool
  try
  {
    var con = db.GetConnection(dbase);  //' get an actual connection to the database
  }
  catch(e)
  {
    Logger(DBG_ERROR,"","","","ConnectToPLSData: Failed to GetConnection to " + dbase + ". ERROR:" + e.description);
    return(null);
  }
  //switch (HL7Data.OStat.toUpperCase())
  switch (OrderStatus)
  {
    case "CA":
    {
      //Delete Existing Record
      //alert("Delete Record from relevant Table: " + tbl + " ")
      con.SQL = "DELETE FROM " + tbl + " WHERE (" + wList + "";
      con.Prepare;
      con.Execute;
      con.Terminate;
      break;
    }
    case "SC":
    {
      //Insert/Update/Modify SQL Table with single where value
      //alert(SQL Work List (wList): " + wList);
      con.SQL = "SELECT * FROM " + tbl + " WHERE (" + wList + "";
      con.Prepare;
      con.Execute;
      if (con.FetchNext)
      {
        //If an entry is found in the recordset update the details
        err = 2;
        con.Terminate;
        //alert("Update data in " + tbl);
        con.SQL = "UPDATE " + tbl + " SET "  + updateList + " WHERE(" + wList + "";
        con.Prepare;
        con.Execute;
        con.Terminate;
      }
      else
      {
        //insert if not already there in table
        err = 1;
        con.Terminate;
        //alert("Insert data into " + tbl);
        con.SQL = "INSERT INTO " + tbl + "(" + fieldList + ") VALUES (" + resultList + ")";
        con.Prepare;
        con.Execute;
        con.Terminate;
      }
      break;
    }
    default:
    {
      err = 3;
      LastErrorMessage = "";
      SendEmail("172.20.11.102","HL7Connect Function SQL ProcSQLData Error","john.carey@mater.org.au","MLSHL7Connect@mater.org.au","SQL PLSData " + tbl + " Database Insert/Update/Delete Error " + err + " no update occured the MessageID is : " + HL7Data.MsgID + " Message MRN: " + HL7Data.PatNum + " for ident.  Error type was (" + err + "): 1 for Insert,2 for Update,3 for default");
      if (LastErrorMessage != "")
      {
        Kernel.WriteToLog(DBG_WARNING,"SendEmail Error " + LastErrorMessage);
      }
    }
  }
  db.YieldConnection(con,'');
  con = null;
  db = null;
  return(null);
} //EndFunction


// function : ProcSQLDataDbase
// purpose  : Process an SQL statement to SQL for the DBase results data only
// return   : null
function ProcSQLDataDbase(tbl,Dbase,HL7Data,fieldList,resultList,updateList)
{
  alert("ProcSQLDataDbase SQL Data Function has started");
  //'var db = kernel.GetDB("PLSData")                    //' get a handle to the global database pool
  //'var con = db.GetConnection("PLSData")               //' get an actual connection to the database
  var db = kernel.GetDB(Dbase);                          //' get a handle to the global database pool
  var con = db.GetConnection(Dbase);                     //' get an actual connection to the database
  //alert("FieldList Variable: " + fieldList);
  //alert("ResultList Variable: " + resultList);
  //alert("UpdateList Variable: " + updateList);
  var err=0;
  switch (HL7Data.OStat.toUpperCase())
  {
    case "CA":
    {
      //'Delete Existing Record
      alert("Delete Record from Table " + tbl);
      con.sql = "DELETE FROM " + tbl + " WHERE (" + tbl + ".txtReqNum) = '"+HL7Data.ReqNum+"'";
      con.prepare;
      con.execute;
      con.terminate;
      break;
    }
    case "SC":
    {
      //'Insert/Update/Modify the HMOLEC table
      //alert(HL7Data.ReqNum);
      con.sql = "SELECT " + tbl + ".* FROM " + tbl + " WHERE (" + tbl + ".txtReqNum) = '"+HL7Data.ReqNum+"'";
      con.prepare;
      con.execute;
      if (con.fetchnext())  //If already there in table just update
      {
        err = 2;
        con.terminate;
        alert("Update table " + tbl);
        con.sql = "UPDATE " + tbl + " SET "  + updateList + " WHERE(" + tbl + ".txtReqNum) = '"+HL7Data.ReqNum+"'";
        con.prepare;
        con.execute;
        con.terminate;
      }
      else //insert if not already there in table
      {
        err = 1;
        con.terminate;
        alert("Insert into table " + tbl);
        con.sql = "INSERT INTO " + tbl + "(" + fieldList + ") VALUES (" + resultList + ")";
        con.prepare;
        con.execute;
        con.terminate;
      }
      break;
    }
    default:
    {
      err = 3;
      LastErrorMessage = "";
      SendEmail("172.20.11.102","HL7Connect SQL ProcSQLDataDbase Error","john.carey@mater.org.au","MLSHL7Connect@mater.org.au","SQL PLSData " + tbl + " Database Insert/Update/Delete Error " + err + " no update occured the MessageID is : " + HL7Data.MsgID + " Message MRN: " + HL7Data.PatNum + " for ident.  Error type was (" + err + "): 1 for Insert,2 for Update");
      if (LastErrorMessage != "")
      {
        Kernel.WriteToLog(DBG_WARNING,"SendEmail Error " + LastErrorMessage);
      }
    }
  }
  db.YieldConnection(con,"");  //' finished; return the connection. always remember to do this
  con = null;
  db = null;
  return(null);
  //alert("SQL Data Function has Processed for this message");
}