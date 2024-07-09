import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth, db } from "./Firebase";
import { toastErr } from "../Utils/toast";
import { authDataType, setLoadingType, taskListType, userType } from "../Types";
import CatchErr from "../Utils/catchErr";
import { NavigateFunction } from "react-router";
import {
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
  doc,
  addDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { defaultUser, setUser, userStorageName } from "../Redux/userSlice";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../Redux/Store";
import ConvertTime from "../Utils/ConvertTime";
import AvatarGenerator from "../Utils/avatarGenerator";
import {
  addTaskList,
  defaultTaskList,
  setTaskList,
} from "../Redux/taskListSlice";

//collection names
const usersColl = "users";
const taskColl = "tasks";
const taskListColl = "tasksList";
const chatsColl = "chats";
const massagesColl = "massages";

// register or signup a user
export const BE_signUp = (
  data: authDataType,
  setLoading: setLoadingType,
  reset: () => void,
  goTo: NavigateFunction,
  dispatch: AppDispatch
) => {
  const { email, password, confirmPassword } = data;

  //loading true
  setLoading(true);

  if (email && password) {
    if (password === confirmPassword) {
      createUserWithEmailAndPassword(auth, email, password)
        .then(async ({ user }) => {
          //generage user avatar with username
          const imgLink = AvatarGenerator(user.email?.split("@")[0]);

          const userInfo = await addUserToCollection(
            user.uid,
            user.email || "",
            user.email?.split("@")[0] || "",
            imgLink
          );

          //set user in store
          dispatch(setUser(userInfo));

          console.log(user);
          setLoading(false);
          reset();
          goTo("/dashboard");
        })
        .catch((err) => {
          CatchErr(err);
          setLoading(false);
        });
    } else toastErr("Password must match!", setLoading);
  } else toastErr("Fields shouldn't be left empty!", setLoading);
};

//sign in a user
export const BE_signIn = (
  data: authDataType,
  setLoading: setLoadingType,
  reset: () => void,
  goTo: NavigateFunction,
  dispatch: AppDispatch
) => {
  const { email, password } = data;

  //loading true
  setLoading(true);

  signInWithEmailAndPassword(auth, email, password)
    .then(async ({ user }) => {
      //TODO: update user is onling

      await updateUserInfo({ id: user.uid, isOnline: true });
      //get user info

      const userInfo = await getUserInfor(user.uid);

      //set user in store
      dispatch(setUser(userInfo));

      console.log(user);
      setLoading(false);
      reset();
      goTo("/dashboard");
    })
    .catch((err) => {
      CatchErr(err);
      setLoading(false);
    });
};

//signout
export const BE_signOut = (
  dispatch: AppDispatch,
  goTo: NavigateFunction,
  setLoading: setLoadingType
) => {
  setLoading(true);
  //login to firebase
  signOut(auth)
    .then(async () => {
      //route to auth page
      goTo("/auth");

      //set user offline
      await updateUserInfo({ isOffline: true });

      //set currentSelected user to empty
      dispatch(setUser(defaultUser));

      //remove from local
      localStorage.removeItem(userStorageName);
      setLoading(false);
    })
    .catch((err) => CatchErr(err));
};

//get user from local storage
export const getStorageUser = () => {
  const usr = localStorage.getItem(userStorageName);
  if (usr) return JSON.parse(usr);
  else return null;
};

//add user to collection
const addUserToCollection = async (
  id: string,
  email: string,
  username: string,
  img: string
) => {
  //creat user with user id
  await setDoc(doc(db, usersColl, id), {
    isOnline: true,
    img,
    username,
    email,
    creationTime: serverTimestamp(),
    lastSeen: serverTimestamp(),
    bio: `Hi my name is Joffi and i am a web developer`,
  });
  return getUserInfor(id);
};

//get user information
const getUserInfor = async (id: string): Promise<userType> => {
  const userRef = doc(db, usersColl, id);
  const user = await getDoc(userRef);

  if (user.exists()) {
    const { img, isOnline, username, email, bio, creationTime, lastSeen } =
      user.data();

    return {
      id: user.id,
      img,
      isOnline,
      username,
      email,
      bio,
      creationTime: creationTime
        ? ConvertTime(creationTime.toDate())
        : "no date yet: userinfor",
      lastSeen: lastSeen
        ? ConvertTime(lastSeen.toDate())
        : "no date yet: userinfor",
    };
  } else {
    toastErr("getUserInfo: user not found");
    return defaultUser;
  }
};

//update user infor
const updateUserInfo = async ({
  id,
  username,
  img,
  isOnline,
  isOffline,
}: {
  id?: string;
  username?: string;
  img?: string;
  isOnline?: boolean;
  isOffline?: boolean;
}) => {
  if (!id) {
    id = getStorageUser().id;
  }

  // if (!id) {
  //   await updateDoc(doc(db, usersColl, id), {
  //     ...(username && { username }),
  //     ...(isOnline && { isOnline }),
  //     ...(isOffline && { isOnline: false }),

  //     ...(img && { img }),

  //     lastSeen: serverTimestamp(),
  //   });
  // }
};

//----------------------------------FOR TASK LIST-----------------------------

//add a single task list
export const BE_addTaskList = async (
  dispatch: AppDispatch,
  setLoading: setLoadingType
) => {
  setLoading(true);
  const { title } = defaultTaskList;
  const list = await addDoc(collection(db, taskListColl), {
    title,
    userId: getStorageUser().id,
  });

  const newDocSnap = await getDoc(doc(db, list.path));
  console.log(newDocSnap);

  if (newDocSnap.exists()) {
    const newlyAddedDoc: taskListType = {
      id: newDocSnap.id,
      title: newDocSnap.data().title,
    };

    dispatch(addTaskList(newlyAddedDoc));
    setLoading(false);
  } else {
    toastErr("BE_addTaskList:No such doc");
    setLoading(false);
  }
};

//get all task list
export const BE_getTaskList = async (
  dispatch: AppDispatch,
  setLoading: setLoadingType
) => {
  setLoading(true);

  //get user task list
  const taskList = await getAllTaskList();

  dispatch(setTaskList(taskList));
  setLoading(false);
};

//get all user tasklist
const getAllTaskList = async () => {
  const q = query(
    collection(db, taskListColl),
    where("userId", "==", getStorageUser().id)
  );

  const taskListSnapshot = await getDocs(q);
  const taskList: taskListType[] = [];

  taskListSnapshot.forEach((doc) => {
    const { title } = doc.data();
    taskList.push({
      id: doc.id,
      title,
      editMode: false,
      tasks: [],
    });
  });

  return taskList;
};
