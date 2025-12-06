import { useQuery } from '@apollo/client';
import { QUERY_NOTIFICATIONS } from '../utils/queries';
import { AiOutlineLoading } from 'react-icons/ai';
import { HiOutlineBell } from 'react-icons/hi';
import Auth from '../utils/auth';
import { Navigate } from 'react-router-dom';

const Notifications = () => {
    if (!Auth.loggedIn()) return <Navigate to="/login" />;

    const { data, loading } = useQuery(QUERY_NOTIFICATIONS);
    const notifications = data?.notifications || [];

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <AiOutlineLoading className="animate-spin h-12 w-12 text-primary" />
            </div>
        );
    }

    return (
        <section className="w-full min-h-screen p-4 md:p-8">
            <h1 className="h1-style mb-8">Notifications</h1>

            {notifications.length > 0 ? (
                <div className="flex flex-col gap-4">
                    {notifications.map((notification) => (
                        <div
                            key={notification._id}
                            className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border-l-4 border-primary hover:shadow-lg transition-shadow"
                        >
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0">
                                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                        <HiOutlineBell className="w-6 h-6 text-primary" />
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
                                        {notification.title}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-300 mb-3">
                                        {notification.message}
                                    </p>
                                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                            {notification.type}
                                        </span>
                                        <span>
                                            {new Date(parseInt(notification.createdAt)).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <HiOutlineBell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-xl text-gray-500 mb-2">No notifications yet</p>
                    <p className="text-gray-400">You'll be notified when new lessons are added to your class.</p>
                </div>
            )}
        </section>
    );
};

export default Notifications;
