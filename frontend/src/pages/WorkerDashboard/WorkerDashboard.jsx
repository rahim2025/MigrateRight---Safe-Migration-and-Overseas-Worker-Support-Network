import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import DashboardHeader from './components/DashboardHeader';
import StatsOverview from './components/StatsOverview';
import QuickAccessGrid from './components/QuickAccessGrid';
import NotificationsFeed from './components/NotificationsFeed';
import RecommendationsPanel from './components/RecommendationsPanel';
import ActivityTimeline from './components/ActivityTimeline';
import ProfileCompletionBanner from './components/ProfileCompletionBanner';
import QuickActionsButton from './components/QuickActionsButton';
import DashboardTutorial from './components/DashboardTutorial';
import workerService from '../../services/workerService';
import './WorkerDashboard.css';

/**
 * Worker Dashboard Page
 * Main dashboard for authenticated workers with personalized content
 */
const WorkerDashboard = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  // Dashboard state
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({
    profileCompleteness: 0,
    reviewsGiven: 0,
    savedCountries: 0,
    applications: 0
  });
  const [notifications, setNotifications] = useState([]);
  const [activities, setActivities] = useState([]);
  const [recommendations, setRecommendations] = useState({
    countries: [],
    agencies: []
  });

  // Loading states
  const [loading, setLoading] = useState({
    profile: true,
    notifications: true,
    activities: true,
    recommendations: true
  });

  // Error states
  const [errors, setErrors] = useState({
    profile: null,
    notifications: null,
    activities: null,
    recommendations: null
  });

  // UI state
  const [showCompletionBanner, setShowCompletionBanner] = useState(true);
  const [showTutorial, setShowTutorial] = useState(false);

  const translations = {
    en: {
      pageTitle: 'Dashboard',
      loadingProfile: 'Loading your dashboard...',
      errorLoadingDashboard: 'Unable to load dashboard data',
      retryButton: 'Retry',
      welcomeBack: 'Welcome back',
      lastLogin: 'Last login',
      profileComplete: 'Profile Complete'
    },
    bn: {
      pageTitle: 'ড্যাশবোর্ড',
      loadingProfile: 'আপনার ড্যাশবোর্ড লোড হচ্ছে...',
      errorLoadingDashboard: 'ড্যাশবোর্ড ডেটা লোড করতে অক্ষম',
      retryButton: 'আবার চেষ্টা করুন',
      welcomeBack: 'স্বাগতম',
      lastLogin: 'শেষ লগইন',
      profileComplete: 'প্রোফাইল সম্পূর্ণ'
    }
  };

  const txt = translations[language] || translations.en;

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login', { state: { from: '/dashboard' } });
    }
  }, [authLoading, isAuthenticated, navigate]);

  // Check for first-time user
  useEffect(() => {
    if (isAuthenticated) {
      const hasSeenTutorial = localStorage.getItem('dashboard_tutorial_completed');
      if (!hasSeenTutorial) {
        setShowTutorial(true);
      }
    }
  }, [isAuthenticated]);

  // Fetch profile data
  const fetchProfile = useCallback(async () => {
    setLoading(prev => ({ ...prev, profile: true }));
    setErrors(prev => ({ ...prev, profile: null }));

    try {
      const response = await workerService.getWorkerProfile();
      const profileData = response.data || response;
      
      setProfile(profileData);
      setStats({
        profileCompleteness: profileData.profileCompleteness || calculateProfileCompleteness(profileData),
        reviewsGiven: profileData.reviewsGiven || 0,
        savedCountries: profileData.preferredDestinations?.length || 0,
        applications: profileData.agencyHistory?.length || 0
      });

      // Check if banner was dismissed
      const bannerDismissed = localStorage.getItem('profile_banner_dismissed');
      setShowCompletionBanner(!bannerDismissed && (profileData.profileCompleteness || 0) < 100);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setErrors(prev => ({ ...prev, profile: error.message || 'Failed to load profile' }));
    } finally {
      setLoading(prev => ({ ...prev, profile: false }));
    }
  }, []);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    setLoading(prev => ({ ...prev, notifications: true }));
    setErrors(prev => ({ ...prev, notifications: null }));

    try {
      const response = await workerService.getNotifications({ limit: 5 });
      setNotifications(response.data || response.notifications || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setErrors(prev => ({ ...prev, notifications: error.message }));
      // Use mock notifications if API fails
      setNotifications(getMockNotifications(language));
    } finally {
      setLoading(prev => ({ ...prev, notifications: false }));
    }
  }, [language]);

  // Fetch activities
  const fetchActivities = useCallback(async () => {
    setLoading(prev => ({ ...prev, activities: true }));
    setErrors(prev => ({ ...prev, activities: null }));

    try {
      const response = await workerService.getActivityHistory({ limit: 10 });
      setActivities(response.data || response.activities || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
      setErrors(prev => ({ ...prev, activities: error.message }));
      // Use mock activities if API fails
      setActivities(getMockActivities(language));
    } finally {
      setLoading(prev => ({ ...prev, activities: false }));
    }
  }, [language]);

  // Fetch recommendations
  const fetchRecommendations = useCallback(async () => {
    setLoading(prev => ({ ...prev, recommendations: true }));
    setErrors(prev => ({ ...prev, recommendations: null }));

    try {
      const [countriesRes, agenciesRes] = await Promise.all([
        workerService.getRecommendedCountries({ limit: 4 }),
        workerService.getRecommendedAgencies({ limit: 3 })
      ]);

      setRecommendations({
        countries: countriesRes.data || countriesRes.countries || [],
        agencies: agenciesRes.data || agenciesRes.agencies || []
      });
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setErrors(prev => ({ ...prev, recommendations: error.message }));
      // Use mock recommendations if API fails
      setRecommendations(getMockRecommendations(language));
    } finally {
      setLoading(prev => ({ ...prev, recommendations: false }));
    }
  }, [language]);

  // Calculate profile completeness
  const calculateProfileCompleteness = (profileData) => {
    if (!profileData) return 0;
    
    let complete = 0;
    let total = 5;

    if (profileData.personalInfo?.fullName) complete++;
    if (profileData.contactInfo?.email || profileData.contactInfo?.phone) complete++;
    if (profileData.workExperience?.length > 0) complete++;
    if (profileData.skills?.length >= 3) complete++;
    if (profileData.documents?.passport) complete++;

    return Math.round((complete / total) * 100);
  };

  // Initial data fetch
  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile();
      fetchNotifications();
      fetchActivities();
      fetchRecommendations();
    }
  }, [isAuthenticated, fetchProfile, fetchNotifications, fetchActivities, fetchRecommendations]);

  // Handle notification dismiss
  const handleDismissNotification = async (notificationId) => {
    try {
      await workerService.dismissNotification(notificationId);
      setNotifications(prev => prev.filter(n => n._id !== notificationId && n.id !== notificationId));
    } catch (error) {
      console.error('Error dismissing notification:', error);
    }
  };

  // Handle banner dismiss
  const handleDismissBanner = () => {
    setShowCompletionBanner(false);
    localStorage.setItem('profile_banner_dismissed', 'true');
  };

  // Handle tutorial complete
  const handleTutorialComplete = () => {
    setShowTutorial(false);
    localStorage.setItem('dashboard_tutorial_completed', 'true');
  };

  // Retry all failed requests
  const handleRetry = () => {
    if (errors.profile) fetchProfile();
    if (errors.notifications) fetchNotifications();
    if (errors.activities) fetchActivities();
    if (errors.recommendations) fetchRecommendations();
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>{txt.loadingProfile}</p>
      </div>
    );
  }

  // Get missing profile sections
  const getMissingSections = () => {
    if (!profile) return [];
    
    const sections = [];
    
    if (!profile.personalInfo?.fullName) {
      sections.push({ key: 'personal', complete: false });
    } else {
      sections.push({ key: 'personal', complete: true });
    }

    if (profile.contactInfo?.email || profile.contactInfo?.phone) {
      sections.push({ key: 'contact', complete: true });
    } else {
      sections.push({ key: 'contact', complete: false });
    }

    if (profile.workExperience?.length > 0) {
      sections.push({ key: 'experience', complete: true });
    } else {
      sections.push({ key: 'experience', complete: false });
    }

    if (profile.skills?.length >= 3) {
      sections.push({ key: 'skills', complete: true });
    } else {
      sections.push({ key: 'skills', complete: false });
    }

    if (profile.documents?.passport) {
      sections.push({ key: 'documents', complete: true });
    } else {
      sections.push({ key: 'documents', complete: false });
    }

    return sections;
  };

  return (
    <div className="worker-dashboard">
      {/* Tutorial Overlay */}
      {showTutorial && (
        <DashboardTutorial 
          onComplete={handleTutorialComplete}
          onSkip={handleTutorialComplete}
          language={language}
        />
      )}

      {/* Profile Completion Banner */}
      {showCompletionBanner && stats.profileCompleteness < 100 && (
        <ProfileCompletionBanner
          completeness={stats.profileCompleteness}
          missingSections={getMissingSections()}
          onDismiss={handleDismissBanner}
          language={language}
        />
      )}

      {/* Dashboard Header */}
      <DashboardHeader
        userName={profile?.personalInfo?.fullName || user?.name || 'Worker'}
        profileCompleteness={stats.profileCompleteness}
        lastLogin={profile?.lastLogin || user?.lastLogin}
        unreadNotifications={notifications.filter(n => !n.read).length}
        loading={loading.profile}
        language={language}
      />

      {/* Main Dashboard Content */}
      <div className="dashboard-content">
        <div className="dashboard-main">
          {/* Stats Overview */}
          <StatsOverview
            stats={stats}
            loading={loading.profile}
            error={errors.profile}
            onRetry={fetchProfile}
            language={language}
          />

          {/* Quick Access Grid */}
          <QuickAccessGrid language={language} />

          {/* Recommendations Panel */}
          <RecommendationsPanel
            countries={recommendations.countries}
            agencies={recommendations.agencies}
            loading={loading.recommendations}
            error={errors.recommendations}
            onRetry={fetchRecommendations}
            language={language}
          />
        </div>

        {/* Sidebar */}
        <div className="dashboard-sidebar">
          {/* Notifications Feed */}
          <NotificationsFeed
            notifications={notifications}
            loading={loading.notifications}
            error={errors.notifications}
            onDismiss={handleDismissNotification}
            onRetry={fetchNotifications}
            language={language}
          />

          {/* Activity Timeline */}
          <ActivityTimeline
            activities={activities}
            loading={loading.activities}
            error={errors.activities}
            onRetry={fetchActivities}
            language={language}
          />
        </div>
      </div>

      {/* Floating Quick Actions Button */}
      <QuickActionsButton language={language} />
    </div>
  );
};

// Mock data functions for fallback
const getMockNotifications = (language) => {
  const isEn = language === 'en';
  return [
    {
      id: '1',
      type: 'profile',
      message: isEn ? 'Complete your profile to improve job matches' : 'আপনার প্রোফাইল সম্পূর্ণ করুন',
      action: '/profile',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      read: false
    },
    {
      id: '2',
      type: 'country',
      message: isEn ? 'New guide available for Malaysia' : 'মালয়েশিয়ার জন্য নতুন গাইড',
      action: '/countries/malaysia',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      read: true
    }
  ];
};

const getMockActivities = (language) => {
  const isEn = language === 'en';
  return [
    {
      id: '1',
      type: 'profile_update',
      description: isEn ? 'Updated personal information' : 'ব্যক্তিগত তথ্য আপডেট করা হয়েছে',
      timestamp: new Date(Date.now() - 7200000).toISOString()
    },
    {
      id: '2',
      type: 'calculator',
      description: isEn ? 'Used fee calculator for Saudi Arabia' : 'সৌদি আরবের জন্য ফি ক্যালকুলেটর ব্যবহার',
      timestamp: new Date(Date.now() - 172800000).toISOString()
    }
  ];
};

const getMockRecommendations = (language) => {
  const isEn = language === 'en';
  return {
    countries: [
      {
        id: '1',
        name: isEn ? 'Saudi Arabia' : 'সৌদি আরব',
        flag: '🇸🇦',
        demand: 'high',
        avgSalary: '$400-600/month'
      },
      {
        id: '2',
        name: isEn ? 'Malaysia' : 'মালয়েশিয়া',
        flag: '🇲🇾',
        demand: 'medium',
        avgSalary: '$350-500/month'
      }
    ],
    agencies: [
      {
        id: '1',
        name: isEn ? 'Trusted Migration Agency' : 'বিশ্বস্ত মাইগ্রেশন এজেন্সি',
        rating: 4.5,
        location: isEn ? 'Dhaka' : 'ঢাকা'
      }
    ]
  };
};

export default WorkerDashboard;
