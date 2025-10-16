import React, { useState } from 'react';
import { useUser } from '../../context/UserContext';
import Table from '../Common/Table';
import Modal from '../Common/Modal';
import UserForm from './UserForm';
import Breadcrumb from '../Common/Breadcrumb';

const UsersList = () => {
  const { users, deleteUser } = useUser();
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  const userTypeLabels = {
    '2': 'Orvos Doctor',
    '3': 'Doctor',
    '4': 'Medical Assistant',
    '5': 'User',
    '6': 'Clinic Admin',
  };

  const filteredUsers = users.filter((user) => {
    if (filterStatus === 'all') return true;
    return user.status === filterStatus;
  });

  const columns = [
    {
      header: 'User',
      accessor: 'name',
      sortValue: (row) => `${row.firstName} ${row.lastName}`,
      render: (row) => (
        <div>
          <p className="font-semibold text-gray-900">{row.firstName} {row.lastName}</p>
          <p className="text-xs text-gray-500">{row.email}</p>
        </div>
      ),
    },
    {
      header: 'Contact',
      accessor: 'phone',
      render: (row) => (
        <div>
          <p className="text-gray-900">{row.phone}</p>
          <p className="text-xs text-gray-500">{row.address}</p>
        </div>
      ),
    },
    {
      header: 'User Type',
      accessor: 'userType',
      sortValue: (row) => userTypeLabels[row.userType] || 'Unknown',
      render: (row) => (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
          {userTypeLabels[row.userType] || 'Unknown'}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
          row.status === 'Active' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {row.status}
        </span>
      ),
    },
    {
      header: 'Created Date',
      accessor: 'createdAt',
      sortValue: (row) => new Date(row.createdAt).getTime(),
      render: (row) => new Date(row.createdAt).toLocaleDateString(),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      sortable: false,
      render: (row) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setEditingUser(row);
              setShowModal(true);
            }}
            className="p-2 text-primary hover:bg-primary-200 rounded-lg transition-colors duration-200"
            title="Edit"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setUserToDelete(row);
              setShowDeleteConfirm(true);
            }}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
            title="Delete"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      ),
    },
  ];

  const handleDelete = () => {
    if (userToDelete) {
      deleteUser(userToDelete.id);
      setShowDeleteConfirm(false);
      setUserToDelete(null);
    }
  };

  return (
    <div>
      <Breadcrumb />
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600 mt-1">Manage system users and their access</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => {
              setEditingUser(null);
              setShowModal(true);
            }}
            className="btn-primary flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Add User</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-card p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Filter by Status:</span>
            <div className="flex space-x-2">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  filterStatus === 'all'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All ({users.length})
              </button>
              <button
                onClick={() => setFilterStatus('Active')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  filterStatus === 'Active'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Active ({users.filter(u => u.status === 'Active').length})
              </button>
              <button
                onClick={() => setFilterStatus('Inactive')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  filterStatus === 'Inactive'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Inactive ({users.filter(u => u.status === 'Inactive').length})
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={filteredUsers}
        emptyMessage="No users found"
      />

      {/* Add/Edit User Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingUser(null);
        }}
        title={editingUser ? 'Edit User' : 'Add New User'}
        size="lg"
      >
        <UserForm
          user={editingUser}
          onClose={() => {
            setShowModal(false);
            setEditingUser(null);
          }}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setUserToDelete(null);
        }}
        title="Confirm Delete"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to delete <strong>{userToDelete?.firstName} {userToDelete?.lastName}</strong>? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => {
                setShowDeleteConfirm(false);
                setUserToDelete(null);
              }}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button onClick={handleDelete} className="btn-danger">
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UsersList;

