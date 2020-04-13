class Firebase {
  constructor() {}

  init() {
    const scripts = ["https://www.gstatic.com/firebasejs/5.8.0/firebase.js"],
      promises = scripts.map(script => this.injectScript(script));

    return Promise.all(promises);
  }

  injectScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.async = true;
      script.src = src;
      script.addEventListener("load", resolve);
      script.addEventListener("error", () => reject("Error loading script."));
      script.addEventListener("abort", () => reject("Script loading aborted."));
      document.head.appendChild(script);
    });
  }

  firebaseInit() {
    if (!firebase.apps.length) {
      // Initialize Firebase
      const config = {
        apiKey: "@@apikey@@",
        authDomain: "@@authDomain@@",
        databaseURL: "@@databaseUrl@@",
        projectId: "@@projectId@@",
        storageBucket: "@@storageBucket@@",
        messagingSenderId: "@@messageSenderId@@"
      };
      firebase.initializeApp(config);
    }
  }

  CreateUserAuthentication(email, password) {
    return firebase.auth().createUserWithEmailAndPassword(email, password);
  }

  CreateUserData(data) {
    return new Promise((resolve, reject) => {
      firebase
        .firestore()
        .collection("users")
        .add(data)
        .then(function(docRef) {
          resolve(docRef.id);
        })
        .catch(function(error) {
          reject(err);
        });
    });
  }

  UserListing(limit) {
    return new Promise((resolve, reject) => {
      let userData = [];
      let query = firebase
        .firestore()
        .collection("users")
        .orderBy("created_at", "desc");
      if (limit) {
        query = query.limit(limit);
      }
      if (this.Ref) {
        query = query.startAfter(this.Ref);
      }
      query
        .get()
        .then(res => {
          if (res.docs && res.docs.length) {
            userData = res.docs.map(data => {
              let userInfo = { id: data.id };
              for (let key in data._document.proto.fields) {
                userInfo[key] = data._document.proto.fields[key].stringValue;
              }
              return userInfo;
            });
            this.Ref = res.docs[res.docs.length - 1];
          }
          resolve(userData);
        })
        .catch(err => reject(err));
    });
  }

  UpdateData(id, data) {
    return firebase
      .firestore()
      .collection("users")
      .doc(id)
      .set(data);
  }

  ForgetPassword(email) {
    return firebase.auth().sendPasswordResetEmail(email);
  }

  DeleteUser(id) {
    return firebase
      .firestore()
      .collection("users")
      .doc(id)
      .delete();
  }
}
