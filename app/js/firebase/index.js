import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/database'

var firebaseConfig = {
    apiKey: "AIzaSyC30IEWo9tpiAu5LRdHnQN6zneorJxmNVI",
    authDomain: "todoapp-5e41b.firebaseapp.com",
    databaseURL: "https://todoapp-5e41b-default-rtdb.firebaseio.com",
    projectId: "todoapp-5e41b",
    storageBucket: "todoapp-5e41b.appspot.com",
    messagingSenderId: "1055950489855",
    appId: "1:1055950489855:web:a6f3a58ecf53f950d9e4ca"
};


export default class Firebase {
    constructor() {
        firebase.initializeApp(firebaseConfig);
        this.database = firebase.database();
        this.firebase = firebase;
    }

    createPostAndGetData(typePost, payload) {
        const database = this.database;

        return new Promise(
            async function(resolve, reject) {
                try {
                    const newPostKey = await database.ref().child(typePost).push(payload).key;
                
                    if(newPostKey) {
                        return resolve(newPostKey);
                    }
                } catch(e) {
                    return reject(e);
                }
            }
        )
    }

    loadPosts(typePost) {
        const firebaseDb = this.database;

        return new Promise(
            function(resolve, reject) {
                firebaseDb.ref(typePost)
				.once('value', function(snapshot) {
                    let posts = snapshot.val();
                    const arrayOfPosts = [];
                    
                    try {
                        if(posts != null) {
                            for(let key in posts) {
                                arrayOfPosts.push({
                                    key,
                                    ...posts[key]
                                })
                            }
                            return resolve(arrayOfPosts);
                        } else {
                            resolve(null);
                        }
                    } catch(e) {
                        reject(e);
                    }
				})
            }
        )
    }

    removePost(typePost, key) {
        const self = this;

        return new Promise(
            function(resolve, reject) {
                try {
                    self.database.ref(`${typePost}/${key}`).remove();
                    return resolve();
                } catch(e) {
                    reject(e);
                }
            }
        )
    }

    getPostById(typePost, key) {
        const self = this;

        return new Promise(
            function(resolve, reject) {
                try {
                    self.database.ref(`${typePost}/`+key).once('value')
                    .then(response => {
                        const data = response.val();
                        if(data) {
                            return resolve(data);
                        } else {
                            return reject(new Error);
                        }
                    })
                } catch(e) {
                    reject(e);
                }
            }
        )
    }

    savePost(typePost, payload) {
        const self = this;
        const { completed, key } = payload;

        return new Promise(
            function(resolve, reject) {
                try {
                    self.database.ref(`${typePost}/` + key).set({
                        ...payload,
                        key: null,
                        completed,
                    })

                    return resolve();

                } catch(e) {
                    reject(e);
                }
            }
        )
    }
}