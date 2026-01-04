import { useState } from 'react';
import PropTypes from 'prop-types';
import './DashboardTutorial.css';

/**
 * Dashboard Tutorial Component
 * Interactive tutorial overlay for first-time users
 */
const DashboardTutorial = ({ onComplete, onSkip, language = 'en' }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const translations = {
    en: {
      steps: [
        {
          title: 'Welcome to Your Dashboard! 👋',
          description: 'This is your personal dashboard where you can manage your migration journey. Let us show you around.',
          icon: '🏠'
        },
        {
          title: 'Quick Access Features ⚡',
          description: 'Access important features like emergency contacts, fee calculator, and agency search right from your dashboard.',
          icon: '🎯'
        },
        {
          title: 'Emergency Contacts 🚨',
          description: 'In case of emergency, quickly access embassy contacts and helpline numbers from the emergency section.',
          icon: '📞'
        },
        {
          title: 'Fee Calculator 🧮',
          description: 'Use the calculator to compare agency fees with legal limits and avoid being overcharged.',
          icon: '💰'
        },
        {
          title: 'Complete Your Profile 📋',
          description: 'Fill in your profile details to get personalized recommendations and better job matches.',
          icon: '✅'
        }
      ],
      skip: 'Skip Tutorial',
      next: 'Next',
      previous: 'Previous',
      finish: 'Get Started',
      stepOf: 'of'
    },
    bn: {
      steps: [
        {
          title: 'আপনার ড্যাশবোর্ডে স্বাগতম! 👋',
          description: 'এটি আপনার ব্যক্তিগত ড্যাশবোর্ড যেখানে আপনি আপনার মাইগ্রেশন যাত্রা পরিচালনা করতে পারবেন।',
          icon: '🏠'
        },
        {
          title: 'দ্রুত অ্যাক্সেস বৈশিষ্ট্য ⚡',
          description: 'আপনার ড্যাশবোর্ড থেকে জরুরি যোগাযোগ, ফি ক্যালকুলেটর এবং এজেন্সি অনুসন্ধানের মতো গুরুত্বপূর্ণ বৈশিষ্ট্যগুলি অ্যাক্সেস করুন।',
          icon: '🎯'
        },
        {
          title: 'জরুরি যোগাযোগ 🚨',
          description: 'জরুরি অবস্থায়, জরুরি বিভাগ থেকে দ্রুত দূতাবাস যোগাযোগ এবং হেল্পলাইন নম্বর অ্যাক্সেস করুন।',
          icon: '📞'
        },
        {
          title: 'ফি ক্যালকুলেটর 🧮',
          description: 'এজেন্সি ফি বৈধ সীমার সাথে তুলনা করতে এবং অতিরিক্ত চার্জ এড়াতে ক্যালকুলেটর ব্যবহার করুন।',
          icon: '💰'
        },
        {
          title: 'আপনার প্রোফাইল সম্পূর্ণ করুন 📋',
          description: 'ব্যক্তিগতকৃত সুপারিশ এবং আরও ভালো চাকরির মিল পেতে আপনার প্রোফাইল বিবরণ পূরণ করুন।',
          icon: '✅'
        }
      ],
      skip: 'টিউটোরিয়াল এড়িয়ে যান',
      next: 'পরবর্তী',
      previous: 'পূর্ববর্তী',
      finish: 'শুরু করুন',
      stepOf: 'এর মধ্যে'
    }
  };

  const txt = translations[language] || translations.en;
  const currentStepData = txt.steps[currentStep];
  const isLastStep = currentStep === txt.steps.length - 1;
  const isFirstStep = currentStep === 0;

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1);
  };

  return (
    <div className="tutorial-overlay">
      <div className="tutorial-modal">
        {/* Progress Dots */}
        <div className="tutorial-progress">
          {txt.steps.map((_, index) => (
            <div 
              key={index}
              className={`progress-dot ${index === currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="tutorial-content">
          <span className="tutorial-icon">{currentStepData.icon}</span>
          <h2 className="tutorial-title">{currentStepData.title}</h2>
          <p className="tutorial-description">{currentStepData.description}</p>
        </div>

        {/* Step Counter */}
        <div className="tutorial-counter">
          {currentStep + 1} {txt.stepOf} {txt.steps.length}
        </div>

        {/* Actions */}
        <div className="tutorial-actions">
          {isFirstStep ? (
            <button className="btn-skip" onClick={onSkip}>
              {txt.skip}
            </button>
          ) : (
            <button className="btn-prev" onClick={handlePrevious}>
              ← {txt.previous}
            </button>
          )}
          
          <button className="btn-next" onClick={handleNext}>
            {isLastStep ? txt.finish : txt.next} {!isLastStep && '→'}
          </button>
        </div>
      </div>
    </div>
  );
};

DashboardTutorial.propTypes = {
  onComplete: PropTypes.func.isRequired,
  onSkip: PropTypes.func.isRequired,
  language: PropTypes.string
};

export default DashboardTutorial;
