import { StyleSheet, Dimensions } from 'react-native';
import { COLORS, SIZES, FONTS } from '../constants/Theme';

const { width, height } = Dimensions.get('window');

export const stilimStyles = StyleSheet.create({
  // Container
  container: {
    flex: 1,
    backgroundColor: COLORS.porcelain,
  },
  
  // Header
  header: {
    padding: SIZES.padding,
    paddingTop: 60,
    backgroundColor: COLORS.white,
    borderBottomLeftRadius: SIZES.radius * 2.5,
    borderBottomRightRadius: SIZES.radius * 2.5,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerTitle: {
    ...FONTS.h1,
    color: COLORS.charcoal,
    marginBottom: SIZES.base / 2,
  },
  headerSubtitle: {
    ...FONTS.body2,
    color: COLORS.ash,
    marginBottom: SIZES.padding,
  },
  
  // User Info
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.porcelain,
    padding: SIZES.padding,
    borderRadius: SIZES.radius * 1.5,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.cognac,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.padding,
  },
  avatarText: {
    color: COLORS.white,
    ...FONTS.h3,
  },
  userName: {
    ...FONTS.body1,
    fontWeight: '600',
    color: COLORS.charcoal,
  },
  userStatus: {
    ...FONTS.body3,
    color: COLORS.ash,
  },
  
  // Style Buttons
  styleSection: {
    padding: SIZES.padding,
  },
  styleSectionTitle: {
    ...FONTS.h3,
    color: COLORS.charcoal,
    marginBottom: SIZES.padding,
  },
  styleButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  styleButton: {
    width: (width - SIZES.padding * 3) / 3,
    backgroundColor: COLORS.white,
    padding: SIZES.padding,
    borderRadius: SIZES.radius * 1.5,
    alignItems: 'center',
    marginBottom: SIZES.base,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: COLORS.cloud,
  },
  styleButtonSelected: {
    backgroundColor: COLORS.cognac,
    borderColor: COLORS.cognac,
  },
  styleButtonText: {
    ...FONTS.body2,
    fontWeight: '600',
    color: COLORS.charcoal,
    marginTop: SIZES.base,
  },
  styleButtonTextSelected: {
    color: COLORS.white,
  },
  
  // Recommendation Cards
  recommendationSection: {
    padding: SIZES.padding,
  },
  sectionTitle: {
    ...FONTS.h3,
    color: COLORS.charcoal,
    marginBottom: SIZES.padding,
  },
  recommendationCard: {
    backgroundColor: COLORS.white,
    padding: SIZES.padding,
    borderRadius: SIZES.radius * 1.8,
    marginBottom: SIZES.padding,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.cloud,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.base,
  },
  timeTag: {
    backgroundColor: COLORS.porcelain,
    paddingHorizontal: SIZES.base,
    paddingVertical: SIZES.base / 2,
    borderRadius: SIZES.radius * 1.5,
  },
  timeText: {
    ...FONTS.body4,
    fontWeight: '600',
    color: COLORS.ash,
  },
  matchPercentage: {
    ...FONTS.body3,
    fontWeight: '600',
    color: COLORS.success,
  },
  outfitContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: SIZES.base,
  },
  clothingItem: {
    alignItems: 'center',
    marginHorizontal: SIZES.base,
  },
  clothingIcon: {
    fontSize: 32,
    marginBottom: SIZES.base / 2,
  },
  clothingText: {
    ...FONTS.body4,
    color: COLORS.ash,
  },
  combinationText: {
    ...FONTS.body3,
    color: COLORS.ash,
    textAlign: 'center',
    marginVertical: SIZES.base,
    fontStyle: 'italic',
  },
  
  // Statistics
  statsSection: {
    padding: SIZES.padding,
    marginBottom: SIZES.padding * 2,
  },
  statsCard: {
    backgroundColor: COLORS.white,
    padding: SIZES.padding,
    borderRadius: SIZES.radius * 1.8,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.cloud,
  },
  statsTitle: {
    ...FONTS.h4,
    color: COLORS.charcoal,
    marginBottom: SIZES.padding,
  },
  statItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SIZES.base,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cloud,
  },
  statLabel: {
    ...FONTS.body3,
    color: COLORS.ash,
  },
  statValue: {
    ...FONTS.body3,
    fontWeight: '600',
    color: COLORS.charcoal,
  },
  
  // AI Assistant
  aiAssistantSection: {
    padding: SIZES.padding,
  },
  aiBubble: {
    backgroundColor: COLORS.porcelain,
    padding: SIZES.padding,
    borderRadius: SIZES.radius * 2,
    borderTopLeftRadius: SIZES.base,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.cloud,
  },
  aiText: {
    ...FONTS.body2,
    color: COLORS.charcoal,
    lineHeight: 22,
  },
  
  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding * 2,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: SIZES.padding,
    opacity: 0.5,
  },
  emptyTitle: {
    ...FONTS.h4,
    color: COLORS.charcoal,
    marginBottom: SIZES.base,
    textAlign: 'center',
  },
  emptyText: {
    ...FONTS.body3,
    color: COLORS.ash,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default stilimStyles;