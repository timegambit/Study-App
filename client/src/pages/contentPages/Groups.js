import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Grid, Typography, Container, Button, Modal, FormHelperText, MenuItem, Select, TextField } from '@material-ui/core';
import {
  baseStyle,
  activeStyle,
  acceptStyle,
  rejectStyle,
} from '../../components/Group/GroupPicture.styles';
import { Tooltip, Box} from '@material-ui/core';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

import { makeStyles } from '@material-ui/core/styles';
import { groups } from '../../data/mockData.js'
import Navbar from '../layout/Navbar';
import GroupCard from '../../components/Group/GroupCard';
import defaultImage from '../../images/upload_placeholder.png';
import { useSnackbar } from 'notistack';

import { useGlobalContext } from '../../context/studyappContext';

const useStyles = makeStyles((theme) => ({

    cardGrid: {
      paddingTop: theme.spacing(8),
      paddingBottom: theme.spacing(8),
    },
    button: {
      color: '#FFF',
      background: theme.palette.primary.gradient,
      marginTop: "60px",
      marginRight: "60px",
      textTransform: 'none',
      height: '3rem',
  },
    paper: {
      position: 'fixed',
      width: 475,
      backgroundColor: theme.palette.background.paper,
      boxShadow: theme.shadows[5],
      padding: theme.spacing(2, 4, 3),
      borderRadius: 4,
      outline: 'none'

    },

    groupImageContainer: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      paddingTop: "10px",
      paddingBottom: "10px"
    },
    large: {
      height: "300px",
      width: "400px",
    },
    uploading: {
      opacity: 0.5,
      height: "300px",
      width: "400px"
    },
    
  }));

  function getModalStyle() {
    const top = 50;
    const left = 50;
  
    return {
      top: `${top}%`,
      left: `${left}%`,
      transform: `translate(-${top}%, -${left}%)`,
    };
  }

const Groups = () => {

  const classes = useStyles();
  const { userCourse, profile } = useGlobalContext();
  const { enqueueSnackbar } = useSnackbar();

  const [modalStyle] = React.useState(getModalStyle);
  const [openModal, setOpen] = useState(false);
  const [courses, setCourses] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [courseId, setCourseId] = useState('');
  const [userProfile, setProfile] = useState([])
  const [groupError, setGroupErrors] = useState('');
  const [groupNames, setGroupNames] = useState([]);

  const [uploading, setUploading] = useState(false);
  const [groupPicture, setGroupPicture] = useState('');
  const [formValid, setFormValid] = useState(false)

  const onDrop = useCallback(async (droppedFiles) => {
    if (droppedFiles.length) {
        setUploading(true);

        const form = new FormData();
        form.append('image', droppedFiles[0]);
        const res = await axios.post('/upload/single', form)
            .catch((err) => console.log(err));
        if (res && res.data) {
            setGroupPicture(res.data.imageUrl)
            setUploading(false)
  
        }
    }
  }, []);

  const {
    getRootProps,
    isDragActive,
    isDragAccept,
    isDragReject,
  } = useDropzone({onDrop, maxFiles: 1, accept: 'image/*'});

  const style = useMemo(() => ({
    ...baseStyle,
    ...(isDragActive ? activeStyle : {}),
    ...(isDragAccept ? acceptStyle : {}),
    ...(isDragReject ? rejectStyle : {})
  }), [
    isDragActive,
    isDragReject,
    isDragAccept
  ]);

  const handleOpen = () => {
    setOpen(true);
    setGroupPicture('');
  };

  const handleClose = () => {
    setOpen(false);
    setGroupPicture('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if(formValid) {

      const data = { groupName: groupName, imageUrl: groupPicture , courseId: courseId};
      const response = await axios.post('/user/groups', data);

      if(response.data) {
        enqueueSnackbar('Group Created Successfully.', {
          variant: 'success',
          autoHideDuration: '5000',
        });
        setOpen(false)
      } else {
        enqueueSnackbar('Error Creating Group.', {
          variant: 'Error',
          autoHideDuration: '5000',
        });
      }
      
    } else {
      enqueueSnackbar('Error Creating Group.', {
          variant: 'Error',
          autoHideDuration: '5000',
      });
    }

  };

  const handleOnChange = async (e) => {
    checkGroupExists(e.target.value.toLowerCase())
    
  }

const checkGroupExists = async (name) => {
  try {

      setGroupName(name)

      if(groupNames.includes(name) !== true) {
        setGroupErrors('');
        setFormValid(true);
        return false;
      } else {
        setGroupErrors("A group with this name already exists!");
        setFormValid(false);
        return true;
      }

  } catch (err) {
      console.log(err);
  }
};

const getUserGroups = async () => {
  const res = await axios.get('/user/groups')
  const groupNames = []
  res.data.forEach(course => {
    course.groups.forEach(group => {
      groupNames.push(group.name.toLowerCase())
    })
 
  })
  setGroupNames(groupNames)
  console.log(groupNames)
}

  useEffect(() => {
    setCourses(userCourse.userCourses);
    setProfile(profile);
    getUserGroups()
    setUploading(false)
  }, []);

    const body = (
      <div style={modalStyle} className={classes.paper}>
      <h2>Create a new group</h2>
      <p>
        Add group name and select your course.
      </p>
      <form className={classes.form} onSubmit={handleSubmit}>
      <FormHelperText>{groupError ? <span style={{color: "#fc2525"}}>{groupError}</span> : 'Please enter a group name'}</FormHelperText>
      <TextField
        name="group_name"
        fullWidth={true}
        variant="outlined"
        onChange={handleOnChange}
      >
      </TextField>

      <Box className={classes.groupImageContainer}>
            <FormHelperText>Drag and Drop Group Picture </FormHelperText>
                  <Tooltip
                      title='Drag and drop profile picture'
                      arrow placement='right'
                  >
                      <Box {...getRootProps({style})}>
                          <img
                              alt='Profile Pic'
                              src={groupPicture.length ? groupPicture : defaultImage}
                              className={uploading ? classes.uploading : classes.large}
                          />
                      </Box>
                  </Tooltip>
              </Box>


      <FormHelperText>Course</FormHelperText>
      <Select
      name="course"
      variant="outlined"
      fullWidth="true"
      defaultValue=""
      >
      { 
      courses.map(course => {
        return (
          <MenuItem
              key={course._id}
              value={course._id}
              onClick={() => setCourseId(course._id)}
              >
              {course.name}
          </MenuItem>
        );
      })}
      </Select>
      <Button
        type="submit"
        className={classes.button}
        style={{marginTop: "20px"}}
      >
        Create New Group
      </Button>                    
      </form>     
            
          
    </div>
    );

    return (
        <Grid>
        <Navbar />
        <Grid container>
          <Grid 
          item
          direction="row"
          container
          md={4} >
          </Grid>
          <Grid 
          item
          justify="center"
          direction="row"
          container
          md={4}>
            <Typography variant="h1" color="textPrimary" style={{ paddingTop: "60px"}}>
                Sugggested For You.
            </Typography>
            <Typography variant="h6" color="textSecondary" style={{ paddingTop: "20px"}}>
                Groups you might be interested in!
            </Typography>
          </Grid>
          <Grid 
          item
          justify="flex-end"
          direction="row"
          container
          md={4}>
            <Button
              className={classes.button}
              onClick={handleOpen}
              >
              Create New Group
            </Button>
            <Modal
              open={openModal}
              onClose={handleClose}
              >
              {body}
          </Modal>
          </Grid>       
        </Grid>

        <Container className={classes.cardGrid} maxWidth="md">
          <Grid container spacing={4}>
            {groups.map((card) => (
              <GroupCard key={card.id} data={card} />
            ))}
          </Grid>
        </Container>
        </Grid>
    );
}

export default Groups;