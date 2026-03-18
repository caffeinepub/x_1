import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Order "mo:core/Order";
import Int "mo:core/Int";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";



actor {
  // TYPES
  type Transaction = {
    id : Nat;
    type_ : Text; // "income", "expense", "investment", "debt"
    amount : Float;
    note : Text;
    category : Text;
    date : Text; // YYYY-MM-DD
    debtPerson : Text;
    createdAt : Int;
  };

  type Person = {
    id : Nat;
    name : Text;
    amount : Float;
    note : Text;
  };

  public type UserProfile = {
    name : Text;
  };

  // State for storing data per user
  type UserData = {
    transactions : Map.Map<Nat, Transaction>;
    people : Map.Map<Nat, Person>;
  };

  // Comparators
  module Transaction {
    public func compareByCreatedAt(t1 : Transaction, t2 : Transaction) : Order.Order {
      Int.compare(t1.createdAt, t2.createdAt);
    };
  };

  let usersData = Map.empty<Principal, UserData>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // Authorization
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Helper Functions
  func ensureUserDataExists(caller : Principal) {
    switch (usersData.get(caller)) {
      case (?_data) { /* User data already exists */ };
      case (null) {
        let newUserData : UserData = {
          transactions = Map.empty<Nat, Transaction>();
          people = Map.empty<Nat, Person>();
        };
        usersData.add(caller, newUserData);
      };
    };
  };

  func getUserData(caller : Principal) : UserData {
    ensureUserDataExists(caller);
    switch (usersData.get(caller)) {
      case (?data) { data };
      case (null) { Runtime.trap("User data not found") };
    };
  };

  func updateUserData(caller : Principal, newData : UserData) {
    usersData.add(caller, newData);
  };

  // USER PROFILE FUNCTIONS
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // TRANSACTIONS
  public shared ({ caller }) func addTransaction(type_ : Text, amount : Float, note : Text, category : Text, date : Text, debtPerson : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add transactions");
    };

    let userData = getUserData(caller);
    let newId = userData.transactions.size() + 1;
    let transaction : Transaction = {
      id = newId;
      type_;
      amount;
      note;
      category;
      date;
      debtPerson;
      createdAt = Time.now();
    };

    let updatedTransactions = userData.transactions.clone();
    updatedTransactions.add(newId, transaction);

    let updatedUserData = {
      transactions = updatedTransactions;
      people = userData.people;
    };

    updateUserData(caller, updatedUserData);
    newId;
  };

  public shared ({ caller }) func editTransaction(id : Nat, type_ : Text, amount : Float, note : Text, category : Text, date : Text, debtPerson : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can edit transactions");
    };

    let userData = getUserData(caller);

    switch (userData.transactions.get(id)) {
      case (null) {
        Runtime.trap("Transaction not found");
      };
      case (?oldTransaction) {
        let updatedTransaction : Transaction = {
          id;
          type_;
          amount;
          note;
          category;
          date;
          debtPerson;
          createdAt = oldTransaction.createdAt;
        };

        let updatedTransactions = userData.transactions.clone();
        updatedTransactions.add(id, updatedTransaction);

        let updatedUserData = {
          transactions = updatedTransactions;
          people = userData.people;
        };

        updateUserData(caller, updatedUserData);
      };
    };
  };

  public shared ({ caller }) func deleteTransaction(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete transactions");
    };

    let userData = getUserData(caller);

    if (not userData.transactions.containsKey(id)) {
      Runtime.trap("Transaction not found");
    };

    let updatedTransactions = userData.transactions.clone();
    updatedTransactions.remove(id);

    let updatedUserData = {
      transactions = updatedTransactions;
      people = userData.people;
    };

    updateUserData(caller, updatedUserData);
  };

  public query ({ caller }) func getAllTransactions() : async [Transaction] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get transactions");
    };

    let userData = getUserData(caller);
    userData.transactions.values().toArray();
  };

  // PEOPLE
  public shared ({ caller }) func addPerson(name : Text, amount : Float, note : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add people");
    };

    let userData = getUserData(caller);
    let newId = userData.people.size() + 1;
    let person : Person = {
      id = newId;
      name;
      amount;
      note;
    };

    let updatedPeople = userData.people.clone();
    updatedPeople.add(newId, person);

    let updatedUserData = {
      transactions = userData.transactions;
      people = updatedPeople;
    };

    updateUserData(caller, updatedUserData);
    newId;
  };

  public shared ({ caller }) func editPerson(id : Nat, name : Text, amount : Float, note : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can edit people");
    };

    let userData = getUserData(caller);

    switch (userData.people.get(id)) {
      case (null) {
        Runtime.trap("Person not found");
      };
      case (?_oldPerson) {
        let updatedPerson : Person = {
          id;
          name;
          amount;
          note;
        };

        let updatedPeople = userData.people.clone();
        updatedPeople.add(id, updatedPerson);

        let updatedUserData = {
          transactions = userData.transactions;
          people = updatedPeople;
        };

        updateUserData(caller, updatedUserData);
      };
    };
  };

  public shared ({ caller }) func deletePerson(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete people");
    };

    let userData = getUserData(caller);

    if (not userData.people.containsKey(id)) {
      Runtime.trap("Person not found");
    };

    let updatedPeople = userData.people.clone();
    updatedPeople.remove(id);

    let updatedUserData = {
      transactions = userData.transactions;
      people = updatedPeople;
    };

    updateUserData(caller, updatedUserData);
  };

  public query ({ caller }) func getAllPeople() : async [Person] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get people");
    };

    let userData = getUserData(caller);
    userData.people.values().toArray();
  };

  // TRANSACTION FILTERING
  public query ({ caller }) func getTransactionsByWeek(startTimestamp : Int, endTimestamp : Int) : async [Transaction] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get transactions");
    };

    let userData = getUserData(caller);

    // Filter transactions using List instead of Array
    let filteredTransactions = List.empty<Transaction>();

    for (transaction in userData.transactions.values()) {
      if (transaction.createdAt >= startTimestamp and transaction.createdAt <= endTimestamp) {
        filteredTransactions.add(transaction);
      };
    };

    filteredTransactions.toArray().sort(Transaction.compareByCreatedAt);
  };

  public query ({ caller }) func getTransactionsByMonth(startTimestamp : Int, endTimestamp : Int) : async [Transaction] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get transactions");
    };

    let userData = getUserData(caller);

    // Filter transactions using List instead of Array
    let filteredTransactions = List.empty<Transaction>();

    for (transaction in userData.transactions.values()) {
      if (transaction.createdAt >= startTimestamp and transaction.createdAt <= endTimestamp) {
        filteredTransactions.add(transaction);
      };
    };

    filteredTransactions.toArray().sort(Transaction.compareByCreatedAt);
  };
};
