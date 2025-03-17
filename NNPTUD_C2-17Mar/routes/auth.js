var express = require('express');
var router = express.Router();
let userController = require('../controllers/users');
const { check_authentication } = require('../Utils/check_auth');

router.post('/signup', async function(req, res, next) {
    try {
        let body = req.body;
        let result = await userController.createUser(
          body.username,
          body.password,
          body.email,
         'user'
        )
        res.status(200).send({
          success:true,
          data:result
        })
      } catch (error) {
        next(error);
      }

})
router.post('/login', async function(req, res, next) {
    try {
        let username = req.body.username;
        let password = req.body.password;
        let result = await userController.checkLogin(username,password);
        res.status(200).send({
            success:true,
            data:result
        })
      } catch (error) {
        next(error);
      }

})
router.get('/me',check_authentication, async function(req, res, next){
    try {
      res.status(200).send({
        success:true,
        data:req.user
    })
    } catch (error) {
        next();
    }
})
// Reset password (Admin only)
router.get('/auth/resetPassword/:id', check_authentication, check_admin, async function(req, res, next) {
  try {
      let userId = req.params.id;
      let user = await userController.getUserById(userId);
      if (!user) {
          return res.status(404).send({ success: false, message: 'User not found' });
      }
      await userController.updatePassword(userId, '123456');
      res.status(200).send({ success: true, message: 'Password has been reset to 123456' });
  } catch (error) {
      next(error);
  }
});

// Change password (Authenticated user only)
router.post('/auth/changePassword', check_authentication, async function(req, res, next) {
  try {
      let userId = req.user.id;
      let { password, newpassword } = req.body;
      let user = await userController.getUserById(userId);
      if (!user) {
          return res.status(404).send({ success: false, message: 'User not found' });
      }
      
      let isMatch = await userController.comparePassword(password, user.password);
      if (!isMatch) {
          return res.status(400).send({ success: false, message: 'Current password is incorrect' });
      }
      
      await userController.updatePassword(userId, newpassword);
      res.status(200).send({ success: true, message: 'Password changed successfully' });
  } catch (error) {
      next(error);
  }
});
module.exports = router