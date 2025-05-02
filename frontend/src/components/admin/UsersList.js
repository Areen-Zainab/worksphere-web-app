import React, { useState } from 'react';
import styles from '../../css/admin/usersList.module.css';

// SVG Icon Components
const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const AddIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>
);

const DeleteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>
);

const SearchOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    <line x1="2" y1="2" x2="22" y2="22"></line>
  </svg>
);

const ChevronLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"></polyline>
  </svg>
);

const ChevronRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
);

const UsersList = ({ users, darkMode, title, compact }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`${styles.usersContainer} ${darkMode ? styles.darkMode : ''}`}>
      <div className={styles.usersHeader}>
        <h2>{title}</h2>
        
        {!compact && (
          <div className={styles.userControls}>
            <div className={styles.searchBox}>
              <SearchIcon />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <button className={styles.addUserBtn}>
              <AddIcon />
              Add User
            </button>
          </div>
        )}
      </div>
      
      {filteredUsers.length > 0 ? (
        <div className={styles.usersList}>
          <table className={styles.usersTable}>
            <thead>
              <tr>
                <th>Name</th>
                {!compact && <th>Email</th>}
                <th>Role</th>
                <th>Status</th>
                {!compact && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id}>
                  <td className={styles.userName}>
                    <div className={styles.userAvatarName}>
                      <div className={styles.userAvatar}>
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span>{user.name}</span>
                    </div>
                  </td>
                  
                  {!compact && <td>{user.email}</td>}
                  
                  <td>
                    <span className={styles.userRole}>{user.role}</span>
                  </td>
                  
                  <td>
                    <span className={`${styles.userStatus} ${user.active ? styles.active : styles.inactive}`}>
                      {user.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  
                  {!compact && (
                    <td className={styles.userActions}>
                      <button className={styles.actionBtn} title="Edit User">
                        <EditIcon />
                      </button>
                      <button className={styles.actionBtn} title="Delete User">
                        <DeleteIcon />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className={styles.noResults}>
          <SearchOffIcon />
          <p>No users found</p>
        </div>
      )}
      
      {!compact && (
        <div className={styles.usersPagination}>
          <button className={styles.paginationBtn} disabled>
            <ChevronLeftIcon />
          </button>
          <span className={styles.paginationInfo}>Page 1 of 1</span>
          <button className={styles.paginationBtn} disabled>
            <ChevronRightIcon />
          </button>
        </div>
      )}
    </div>
  );
};

export default UsersList;