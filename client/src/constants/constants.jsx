import { HiOutlineHome, HiOutlineUserCircle, HiOutlineClipboardList, HiOutlineBell, HiOutlineClock } from 'react-icons/hi';
import { IoLanguage } from 'react-icons/io5';
import { MdOutlineLeaderboard } from 'react-icons/md';
import { FaGithub } from 'react-icons/fa';
import { BsStars } from 'react-icons/bs';

const sidebarNavItems = [
  {
    title: 'Lessons',
    path: '/lessons',
    icon: <HiOutlineHome className="sidebar-btn-icon" />,
  },
  {
    title: 'Notifications',
    path: '/notifications',
    icon: <HiOutlineBell className="sidebar-btn-icon" />,
  },
  {
    title: 'AI Quiz',
    path: '/ai-quiz',
    icon: <BsStars className="sidebar-btn-icon" />,
  },
  {
    title: 'My Quizzes',
    path: '/personal-quizzes',
    icon: <HiOutlineClipboardList className="sidebar-btn-icon" />,
  },
  {
    title: 'Leaderboards',
    path: '/leaderboards',
    icon: <MdOutlineLeaderboard className="sidebar-btn-icon" />,
  },
  {
    title: 'Profile',
    path: '/profile',
    icon: <HiOutlineUserCircle className="sidebar-btn-icon" />,
  },
  {
    title: 'Timed Quiz',
    path: '/timed-quiz',
    icon: <HiOutlineClock className="sidebar-btn-icon" />,
  },
];

const socialLinks = [
  {
    title: 'Github',
    url: 'https://github.com/kt946/japanese-quiz-mern-app',
    icon: <FaGithub className="social-link" />,
  },
];

export { sidebarNavItems, socialLinks };
