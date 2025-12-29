import { Router } from 'express';
import userController from '../controllers/userController';
import userGroupController from '../controllers/userGroup.controller';
import { auth, isAdmin } from '../controllers/auth.controller';
import validatePostData from '../validatePostData';

const router = Router();

// User Group
router.get('/user-groups', auth, userGroupController.getAllUserGroups);
router.patch('/user-groups/:id', auth, validatePostData(['group_code', 'group_name']), userGroupController.updateUserGroup);
router.post('/user-groups', auth, validatePostData(['group_code', 'group_name']), userGroupController.createUserGroup);

// User
router.get('/users/test', auth, userController.test);
router.get('/users', auth, userController.getAllUsers);
router.delete('/users/:id', auth, isAdmin, userController.deleteUser);
router.patch('/users/:id', auth, validatePostData(['name', 'group_id', 'role']), userController.updateUser);
router.post('/users/register', auth, validatePostData(['name', 'username', 'password', 'group_id', 'role']), userController.createUser);
router.post('/users/changepass', auth, validatePostData(['current_password', 'new_password']), userController.changePassword);

export default router;

