import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { Search, ChevronDown, ChevronUp } from "lucide-react-native";
import { useRouter } from "expo-router";
import Header from "@/components/Header";

interface FAQ {
  id: string;
  category: string;
  categoryColor: string;
  question: string;
  answer: string;
}

export default function FAQsScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>("1");

  const faqs: FAQ[] = [
    {
      id: "1",
      category: "Attendance",
      categoryColor: "#8B5CF6",
      question: "How do I punch in/out?",
      answer: 'To punch in, go to the Dashboard and tap the "Punch In" button. Make sure your location services are enabled. To punch out, tap the "Punch Out" button at the end of your shift.',
    },
    {
      id: "2",
      category: "Attendance",
      categoryColor: "#8B5CF6",
      question: "What if I forget to punch out?",
      answer: "If you forget to punch out, please contact your supervisor or use the Contact Support feature to report the issue. Your attendance will be manually corrected.",
    },
    {
      id: "3",
      category: "Leaves",
      categoryColor: "#10B981",
      question: "How do I apply for leave?",
      answer: "Go to the Attendance tab, select the date you want to apply leave for, and submit your leave request with the reason. Your supervisor will approve or reject the request.",
    },
    {
      id: "4",
      category: "Salary",
      categoryColor: "#3B82F6",
      question: "When will I receive my salary?",
      answer: "Salaries are processed on the last working day of each month. You will receive the payment in your registered bank account within 2-3 business days.",
    },
    {
      id: "5",
      category: "Salary",
      categoryColor: "#3B82F6",
      question: "How can I view my payslip?",
      answer: "Go to the Payouts tab and tap on History. Select the month you want to view and tap on the transaction to see your detailed payslip.",
    },
    {
      id: "6",
      category: "Profile",
      categoryColor: "#F59E0B",
      question: "How do I update my bank details?",
      answer: "Go to Profile > Bank Account and update your bank account number, IFSC code, and account holder name. Make sure to verify the details before saving.",
    },
    {
      id: "7",
      category: "Shifts",
      categoryColor: "#EF4444",
      question: "Can I change my shift timings?",
      answer: "Shift timings are assigned by your supervisor based on operational requirements. If you need to change your shift, please contact your supervisor or HR through the Contact Support feature.",
    },
    {
      id: "8",
      category: "Documents",
      categoryColor: "#F97316",
      question: "What documents do I need to upload?",
      answer: "You need to upload Aadhaar Card, PAN Card, and a recent photograph. All documents should be clear and legible. Once uploaded, they will be verified by the admin.",
    },
    {
      id: "9",
      category: "Performance",
      categoryColor: "#8B5CF6",
      question: "How do I track my performance?",
      answer: "Your performance metrics including attendance rate, on-time percentage, and completed tasks are tracked automatically. You can view them in the Dashboard under Performance section.",
    },
    {
      id: "10",
      category: "Support",
      categoryColor: "#10B981",
      question: "Who do I contact for app issues?",
      answer: "For any app-related issues, go to Profile > Support & Settings > Contact Support. Fill in the form with your issue details and our support team will respond within 24-48 hours.",
    },
  ];

  const filteredFAQs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="FAQs" subtitle="Find answers quickly" />

      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Search color="#9CA3AF" size={20} strokeWidth={2} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search questions..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredFAQs.map((faq) => (
          <TouchableOpacity
            key={faq.id}
            style={styles.faqCard}
            activeOpacity={0.7}
            onPress={() => toggleExpand(faq.id)}
          >
            <View style={styles.faqHeader}>
              <View style={styles.faqContent}>
                <View
                  style={[
                    styles.categoryBadge,
                    { backgroundColor: `${faq.categoryColor}20` },
                  ]}
                >
                  <Text
                    style={[styles.categoryText, { color: faq.categoryColor }]}
                  >
                    {faq.category}
                  </Text>
                </View>
                <Text style={styles.questionText}>{faq.question}</Text>
              </View>
              {expandedId === faq.id ? (
                <ChevronUp color="#9CA3AF" size={20} strokeWidth={2} />
              ) : (
                <ChevronDown color="#9CA3AF" size={20} strokeWidth={2} />
              )}
            </View>

            {expandedId === faq.id && (
              <Text style={styles.answerText}>{faq.answer}</Text>
            )}
          </TouchableOpacity>
        ))}

        {filteredFAQs.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No FAQs found</Text>
            <Text style={styles.emptySubtext}>
              Try searching with different keywords
            </Text>
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  searchInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: "400" as const,
    color: "#111827",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  faqCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  faqHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  faqContent: {
    flex: 1,
  },
  categoryBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "600" as const,
  },
  questionText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#111827",
    lineHeight: 22,
  },
  answerText: {
    fontSize: 14,
    fontWeight: "400" as const,
    color: "#6B7280",
    lineHeight: 20,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#111827",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    fontWeight: "400" as const,
    color: "#9CA3AF",
  },
  bottomSpacer: {
    height: 20,
  },
});
