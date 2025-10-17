// contexts/LanguageContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'mr';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// English translations
const enTranslations: Record<string, string> = {
  // Common
  'loading': 'Loading...',
  'save': 'Save',
  'cancel': 'Cancel',
  'delete': 'Delete',
  'edit': 'Edit',
  'add': 'Add',
  'search': 'Search',
  'filter': 'Filter',
  'export': 'Export',
  
  // Auth
  'login': 'Login',
  'register': 'Register',
  'email': 'Email',
  'password': 'Password',
  'confirm_password': 'Confirm Password',
  
  // Dairy Dashboard
  'dairy_management_system': 'Dairy Management System',
  'overview': 'Overview',
  'milk_collection': 'Milk Collection',
  'rate_calculator': 'Rate Calculator',
  'collection_history': 'Collection History',
  'farmers_management': 'Farmers Management',
  'dairy_settings': 'Dairy Settings',
  'sign_out': 'Sign Out',
  
  // Overview
  'welcome_dairy': 'Welcome to Dairy Management',
  'todays_collection': "Today's Collection",
  'todays_revenue': "Today's Revenue",
  'active_farmers': 'Active Farmers',
  'avg_rate_liter': 'Avg Rate/Liter',
  'from_yesterday': 'from yesterday',
  'quick_actions': 'Quick Actions',
  'add_milk_collection': 'Add Milk Collection',
  'manage_farmers': 'Manage Farmers',
  'recent_collections': 'Recent Collections',
  'farmers': 'farmers',
  
  // Milk Collection
  'record_milk_collections': 'Record daily milk collections from farmers',
  'new_collection': 'New Collection',
  'enter_milk_details': 'Enter milk collection details',
  'farmer': 'Farmer',
  'select_farmer': 'Select farmer',
  'milk_type': 'Milk Type',
  'select_milk_type': 'Select milk type',
  'cow_milk': 'Cow Milk',
  'buffalo_milk': 'Buffalo Milk',
  'quantity_liters': 'Quantity (Liters)',
  'enter_quantity': 'Enter quantity',
  'fat_content': 'Fat Content (%)',
  'enter_fat_percentage': 'Enter fat percentage',
  'degree': 'Degree',
  'enter_degree': 'Enter degree',
  'snf': 'SNF',
  'rate_l': 'Rate/L',
  'record_collection': 'Record Collection',
  'recording': 'Recording...',
  'todays_collections': "Today's Collections",
  'entries': 'entries',
  'no_collections_today': 'No collections today',
  'total': 'Total',
  
  // Rate Calculator
  'calculate_milk_rates': 'Calculate milk rates based on fat and SNF content',
  'calculate_rate': 'Calculate Rate',
  'enter_milk_parameters': 'Enter milk parameters to calculate rate',
  'milk_quantity': 'Milk Quantity',
  'rate_per_kg_fat': 'Rate per Kg Fat (₹)',
  'enter_rate_kg_fat': 'Enter rate per kg fat',
  'calculate': 'Calculate',
  'calculation_complete': 'Calculation Complete',
  'total_amount': 'Total Amount',
  'rate_chart': 'Rate Chart',
  'current_pricing': 'Current pricing based on fat and SNF content',
  'min_fat': 'Min Fat %',
  'min_snf': 'Min SNF %',
  'rate_liter': 'Rate/Liter (₹)',
  'calculation_formula': 'Calculation Formula',
  'how_rates_calculated': 'How rates are calculated',
  'snf_calculation': 'SNF Calculation',
  'rate_determination': 'Rate Determination',
  'total_amount_calculation': 'Total Amount Calculation',
  
  // Collection History
  'view_analyze_records': 'View and analyze milk collection records',
  'filters_search': 'Filters & Search',
  'search_farmer': 'Search Farmer',
  'search_farmers': 'Search farmers...',
  'date': 'Date',
  'all_types': 'All Types',
  'view_mode': 'View Mode',
  'daily_summary': 'Daily Summary',
  'detailed_view': 'Detailed View',
  'detailed_collections': 'Detailed Collections',
  'daily_summaries': 'Daily Summaries',
  'records': 'records',
  'date_time': 'Date & Time',
  'farmer_name': 'Farmer Name',
  'quantity_l': 'Quantity (L)',
  'total_collections': 'Total Collections',
  'avg_fat': 'Avg Fat %',
  'avg_snf': 'Avg SNF %',
  'avg_rate_l': 'Avg Rate/L',
  'no_records_found': 'No records found',
  'no_summary_records': 'No summary records found',
  
  // Farmers Management
  'manage_dairy_farmers': 'Manage your dairy farmers and their details',
  'farmers_list': 'Farmers List',
  'search_name_mobile': 'Search by name or mobile...',
  'total_farmers': 'Total Farmers',
  'cow_milk_only': 'Cow Milk Only',
  'buffalo_milk_only': 'Buffalo Milk Only',
  'farmer_details': 'Farmer Details',
  'join_date': 'Join Date',
  'status': 'Status',
  'actions': 'Actions',
  'active': 'Active',
  'inactive': 'Inactive',
  'deactivate': 'Deactivate',
  'activate': 'Activate',
  'no_farmers_found': 'No farmers found matching your search',
  'no_farmers_added': 'No farmers added yet',
  'add_new_farmer': 'Add New Farmer',
  'edit_farmer': 'Edit Farmer',
  'update_farmer_details': 'Update farmer details and information',
  'add_farmer_system': 'Add a new farmer to your dairy management system',
  'farmer_name_required': 'Farmer Name *',
  'mobile_number': 'Mobile Number',
  'mobile_number_required': 'Mobile Number *',
  'address': 'Address',
  'full_address': 'Full address',
  'bank_details': 'Bank Details',
  'bank_details_optional': 'Bank Details (Optional)',
  'account_number': 'Account Number',
  'bank_name': 'Bank Name',
  'ifsc_code': 'IFSC Code',
  'both_cow_buffalo': 'Both Cow & Buffalo',
  
  // Dairy Settings
  'configure_dairy_system': 'Configure your dairy management system',
  'save_settings': 'Save Settings',
  'saving': 'Saving...',
  'general_information': 'General Information',
  'basic_dairy_details': 'Basic details about your dairy business',
  'dairy_name': 'Dairy Name *',
  'enter_dairy_name': 'Enter dairy name',
  'contact_number': 'Contact Number',
  'enter_contact_number': 'Enter contact number',
  'enter_dairy_address': 'Enter dairy address',
  'gst_number': 'GST Number',
  'enter_gst_number': 'Enter GST number',
  'set_rates_fat_snf': 'Set rates based on fat and SNF content',
  'add_rate': 'Add Rate',
  'action': 'Action',
  'cannot_remove_last': 'Cannot remove the last rate item',
  'payment_settings': 'Payment Settings',
  'configure_payment_cycles': 'Configure payment cycles and methods',
  'payment_cycle': 'Payment Cycle',
  'select_payment_cycle': 'Select payment cycle',
  'daily': 'Daily',
  'weekly': 'Weekly',
  'monthly': 'Monthly',
  'payment_day': 'Payment Day',
  'payment_date': 'Payment Date',
  'select_day': 'Select day',
  'enable_advance_payments': 'Enable Advance Payments',
  'current_payment_setup': 'Current Payment Setup',
  'cycle': 'Cycle',
  'advance_payments': 'Advance Payments',
  'enabled': 'Enabled',
  'disabled': 'Disabled'
};

// Marathi translations
const mrTranslations: Record<string, string> = {
  // Common
  'loading': 'लोड होत आहे...',
  'save': 'जतन करा',
  'cancel': 'रद्द करा',
  'delete': 'काढून टाका',
  'edit': 'संपादित करा',
  'add': 'जोडा',
  'search': 'शोधा',
  'filter': 'फिल्टर',
  'export': 'निर्यात करा',
  
  // Auth
  'login': 'लॉगिन',
  'register': 'नोंदणी करा',
  'email': 'ईमेल',
  'password': 'पासवर्ड',
  'confirm_password': 'पासवर्डची पुष्टी करा',
  
  // Dairy Dashboard
  'dairy_management_system': 'डेअरी व्यवस्थापन प्रणाली',
  'overview': 'आढावा',
  'milk_collection': 'दुध संकलन',
  'rate_calculator': 'दर कॅल्क्युलेटर',
  'collection_history': 'संकलन इतिहास',
  'farmers_management': 'शेतकरी व्यवस्थापन',
  'dairy_settings': 'डेअरी सेटिंग्ज',
  'sign_out': 'साइन आउट',
  
  // Overview
  'welcome_dairy': 'डेअरी व्यवस्थापनात आपले स्वागत आहे',
  'todays_collection': 'आजचे संकलन',
  'todays_revenue': 'आजचे उत्पन्न',
  'active_farmers': 'सक्रिय शेतकरी',
  'avg_rate_liter': 'सरासरी दर/लीटर',
  'from_yesterday': 'कालच्या तुलनेत',
  'quick_actions': 'द्रुत क्रिया',
  'add_milk_collection': 'दुध संकलन जोडा',
  'manage_farmers': 'शेतकऱ्यांचे व्यवस्थापन',
  'recent_collections': 'अलीकडील संकलने',
  'farmers': 'शेतकरी',
  
  // Milk Collection
  'record_milk_collections': 'शेतकऱ्यांकडून दैनंदिन दुध संकलन नोंदवा',
  'new_collection': 'नवीन संकलन',
  'enter_milk_details': 'दुध संकलनाच्या तपशिलांसह प्रविष्ट करा',
  'farmer': 'शेतकरी',
  'select_farmer': 'शेतकरी निवडा',
  'milk_type': 'दुधाचा प्रकार',
  'select_milk_type': 'दुधाचा प्रकार निवडा',
  'cow_milk': 'गायीचे दूध',
  'buffalo_milk': 'म्हशीचे दूध',
  'quantity_liters': 'प्रमाण (लीटर)',
  'enter_quantity': 'प्रमाण प्रविष्ट करा',
  'fat_content': 'फॅट सामग्री (%)',
  'enter_fat_percentage': 'फॅट टक्केवारी प्रविष्ट करा',
  'degree': 'डिग्री',
  'enter_degree': 'डिग्री प्रविष्ट करा',
  'snf': 'एसएनएफ',
  'rate_l': 'दर/ली',
  'record_collection': 'संकलन नोंदवा',
  'recording': 'नोंदवत आहे...',
  'todays_collections': 'आजची संकलने',
  'entries': 'नोंदी',
  'no_collections_today': 'आज संकलन नाही',
  'total': 'एकूण',
  
  // Rate Calculator
  'calculate_milk_rates': 'फॅट आणि एसएनएफ सामग्रीवर आधारित दुधाचे दर मोजा',
  'calculate_rate': 'दर मोजा',
  'enter_milk_parameters': 'दर मोजण्यासाठी दुधाचे पॅरामीटर्स प्रविष्ट करा',
  'milk_quantity': 'दुधाचे प्रमाण',
  'rate_per_kg_fat': 'प्रति किलो फॅट दर (₹)',
  'enter_rate_kg_fat': 'प्रति किलो फॅट दर प्रविष्ट करा',
  'calculate': 'मोजा',
  'calculation_complete': 'गणना पूर्ण झाली',
  'total_amount': 'एकूण रक्कम',
  'rate_chart': 'दर सारणी',
  'current_pricing': 'फॅट आणि एसएनएफ सामग्रीवर आधारित सद्य किंमत',
  'min_fat': 'किमान फॅट %',
  'min_snf': 'किमान एसएनएफ %',
  'rate_liter': 'दर/लीटर (₹)',
  'calculation_formula': 'गणना सूत्र',
  'how_rates_calculated': 'दर कसे मोजले जातात',
  'snf_calculation': 'एसएनएफ गणना',
  'rate_determination': 'दर निर्धारण',
  'total_amount_calculation': 'एकूण रक्कम गणना',
  
  // Collection History
  'view_analyze_records': 'दुध संकलन नोंदी पहा आणि विश्लेषण करा',
  'filters_search': 'फिल्टर्स आणि शोध',
  'search_farmer': 'शेतकरी शोधा',
  'search_farmers': 'शेतकऱ्यांना शोधा...',
  'date': 'तारीख',
  'all_types': 'सर्व प्रकार',
  'view_mode': 'दृश्य मोड',
  'daily_summary': 'दैनंदिन सारांश',
  'detailed_view': 'तपशीलवार दृश्य',
  'detailed_collections': 'तपशीलवार संकलने',
  'daily_summaries': 'दैनंदिन सारांश',
  'records': 'नोंदी',
  'date_time': 'तारीख आणि वेळ',
  'farmer_name': 'शेतकऱ्याचे नाव',
  'quantity_l': 'प्रमाण (ली)',
  'total_collections': 'एकूण संकलने',
  'avg_fat': 'सरासरी फॅट %',
  'avg_snf': 'सरासरी एसएनएफ %',
  'avg_rate_l': 'सरासरी दर/ली',
  'no_records_found': 'कोणत्याही नोंदी आढळल्या नाहीत',
  'no_summary_records': 'कोणतेही सारांश नोंदी आढळल्या नाहीत',
  
  // Farmers Management
  'manage_dairy_farmers': 'आपल्या डेअरी शेतकऱ्यांचे व्यवस्थापन करा',
  'farmers_list': 'शेतकऱ्यांची यादी',
  'search_name_mobile': 'नाव किंवा मोबाईल नंबरने शोधा...',
  'total_farmers': 'एकूण शेतकरी',
  'cow_milk_only': 'फक्त गायीचे दूध',
  'buffalo_milk_only': 'फक्त म्हशीचे दूध',
  'farmer_details': 'शेतकऱ्याचे तपशील',
  'join_date': 'सामील होण्याची तारीख',
  'status': 'स्थिती',
  'actions': 'क्रिया',
  'active': 'सक्रिय',
  'inactive': 'निष्क्रिय',
  'deactivate': 'निष्क्रिय करा',
  'activate': 'सक्रिय करा',
  'no_farmers_found': 'आपल्या शोधाशी जुळणारे कोणतेही शेतकरी आढळले नाहीत',
  'no_farmers_added': 'अद्याप कोणतेही शेतकरी जोडलेले नाहीत',
  'add_new_farmer': 'नवीन शेतकरी जोडा',
  'edit_farmer': 'शेतकरी संपादित करा',
  'update_farmer_details': 'शेतकऱ्याचे तपशील अद्यतनित करा',
  'add_farmer_system': 'आपल्या डेअरी व्यवस्थापन प्रणालीमध्ये नवीन शेतकरी जोडा',
  'farmer_name_required': 'शेतकऱ्याचे नाव *',
  'mobile_number': 'मोबाईल नंबर',
  'mobile_number_required': 'मोबाईल नंबर *',
  'address': 'पत्ता',
  'full_address': 'पूर्ण पत्ता',
  'bank_details': 'बँक तपशील',
  'bank_details_optional': 'बँक तपशील (ऐच्छिक)',
  'account_number': 'खाते क्रमांक',
  'bank_name': 'बँकेचे नाव',
  'ifsc_code': 'आयएफएससी कोड',
  'both_cow_buffalo': 'गाय आणि म्हैस दोन्ही',
  
  // Dairy Settings
  'configure_dairy_system': 'आपली डेअरी व्यवस्थापन प्रणाली कॉन्फिगर करा',
  'save_settings': 'सेटिंग्ज जतन करा',
  'saving': 'जतन करत आहे...',
  'general_information': 'सामान्य माहिती',
  'basic_dairy_details': 'आपल्या डेअरी व्यवसायाबद्दल मूलभूत तपशील',
  'dairy_name': 'डेअरीचे नाव *',
  'enter_dairy_name': 'डेअरीचे नाव प्रविष्ट करा',
  'contact_number': 'संपर्क क्रमांक',
  'enter_contact_number': 'संपर्क क्रमांक प्रविष्ट करा',
  'enter_dairy_address': 'डेअरीचा पत्ता प्रविष्ट करा',
  'gst_number': 'जीएसटी नंबर',
  'enter_gst_number': 'जीएसटी नंबर प्रविष्ट करा',
  'set_rates_fat_snf': 'फॅट आणि एसएनएफ सामग्रीवर आधारित दर सेट करा',
  'add_rate': 'दर जोडा',
  'action': 'क्रिया',
  'cannot_remove_last': 'शेवटचा दर आयटम काढू शकत नाही',
  'payment_settings': 'पेमेंट सेटिंग्ज',
  'configure_payment_cycles': 'पेमेंट सायकल आणि पद्धती कॉन्फिगर करा',
  'payment_cycle': 'पेमेंट सायकल',
  'select_payment_cycle': 'पेमेंट सायकल निवडा',
  'daily': 'दररोज',
  'weekly': 'साप्ताहिक',
  'monthly': 'मासिक',
  'payment_day': 'पेमेंट दिवस',
  'payment_date': 'पेमेंट तारीख',
  'select_day': 'दिवस निवडा',
  'enable_advance_payments': 'अग्रिम पेमेंट सक्षम करा',
  'current_payment_setup': 'सद्य पेमेंट सेटअप',
  'cycle': 'सायकल',
  'advance_payments': 'अग्रिम पेमेंट',
  'enabled': 'सक्षम',
  'disabled': 'अक्षम'
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    if (language === 'mr') {
      return mrTranslations[key] || enTranslations[key] || key;
    }
    return enTranslations[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};