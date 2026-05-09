import { StyleSheet } from 'react-native';
import { COLORS, SIZES, FONTS } from '../constants/Theme';  // ✅ FONTS import eklendi

export const globalStyles = StyleSheet.create({
  // Container stilleri
  container: {
    flex: 1,
    backgroundColor: COLORS.porcelain,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding,
  },
  
  // Kart stilleri
  card: {
    margin: SIZES.base,
    elevation: 4,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.cloud,
  },
  cardImage: {
    height: 200,
    backgroundColor: COLORS.porcelain,
  },
  cardContent: {
    padding: SIZES.padding,
  },
  categoryText: {
    color: COLORS.ash,
    marginTop: SIZES.base / 2,
    ...FONTS.body4,
  },
  
  // List stilleri
  listContainer: {
    padding: SIZES.base,
  },
  
  // Form stilleri
  formContainer: {
    padding: SIZES.padding,
  },
  input: {
    marginBottom: SIZES.padding,
    backgroundColor: COLORS.white,
  },
  submitButton: {
    marginTop: SIZES.padding,
    paddingVertical: SIZES.base,
    backgroundColor: COLORS.cognac,
    borderRadius: SIZES.radius,
  },
  submitButtonText: {
    color: COLORS.white,
    ...FONTS.body2,
    fontWeight: '600',
    textAlign: 'center',
  },
  
  // Resim stilleri
  imageSection: {
    alignItems: 'center',
    marginBottom: SIZES.padding,
  },
  previewImage: {
    width: 200,
    height: 200,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.base,
    borderWidth: 1,
    borderColor: COLORS.cloud,
  },
  imagePlaceholder: {
    width: 200,
    height: 200,
    backgroundColor: COLORS.cloud,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: SIZES.radius,
    marginBottom: SIZES.base,
    borderWidth: 1,
    borderColor: COLORS.silver,
    borderStyle: 'dashed',
  },
  imagePlaceholderText: {
    color: COLORS.ash,
    ...FONTS.body3,
  },
  imageButton: {
    marginBottom: SIZES.base,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.cognac,
  },
  imageButtonText: {
    color: COLORS.cognac,
  },
  
  // Diğer stiller
  fab: {
    position: 'absolute',
    margin: SIZES.padding,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.cognac,
    borderRadius: 28,
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabIcon: {
    color: COLORS.white,
  },
  divider: {
    marginVertical: SIZES.padding,
    height: 1,
    backgroundColor: COLORS.cloud,
  },
  
  // Row stilleri
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.base,
  },
  
  // Badge stilleri
  badge: {
    paddingHorizontal: SIZES.base,
    paddingVertical: SIZES.base / 2,
    borderRadius: SIZES.base,
    backgroundColor: COLORS.gold,
    alignSelf: 'flex-start',
  },
  badgeText: {
    color: COLORS.black,
    ...FONTS.micro,
    fontWeight: '700',
  },
  
  // Header stilleri
  header: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cloud,
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.base * 2,
  },
  headerTitle: {
    ...FONTS.h3,
    color: COLORS.charcoal,
    textAlign: 'center',
  },
  
  // Empty state stilleri
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding * 2,
  },
  emptyIcon: {
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

export default globalStyles;