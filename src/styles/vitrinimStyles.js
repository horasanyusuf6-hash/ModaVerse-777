import { StyleSheet } from 'react-native';
import { COLORS, SIZES, FONTS } from '../constants/Theme';

export const vitrinimStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.porcelain,
  },
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
  },
  headerSubtitle: {
    ...FONTS.body2,
    color: COLORS.ash,
    marginTop: SIZES.base,
  },
  personalMessage: {
    backgroundColor: COLORS.ivory,
    margin: SIZES.padding,
    padding: SIZES.padding,
    borderRadius: SIZES.radius * 1.5,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.cognac,
  },
  messageTitle: {
    ...FONTS.h4,
    fontWeight: '600',
    color: COLORS.charcoal,
    marginBottom: SIZES.base / 2,
  },
  messageText: {
    ...FONTS.body3,
    color: COLORS.slate,
    lineHeight: 20,
  },
  productCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: SIZES.padding,
    marginVertical: SIZES.base,
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
  tagContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.base,
  },
  productTag: {
    backgroundColor: COLORS.porcelain,
    color: COLORS.ash,
    paddingHorizontal: SIZES.base,
    paddingVertical: SIZES.base / 2,
    borderRadius: SIZES.radius * 1.5,
    fontSize: 12,
    fontWeight: '600',
    overflow: 'hidden',
  },
  matchText: {
    ...FONTS.body4,
    color: COLORS.success,
    fontWeight: '600',
  },
  productInfo: {
    marginVertical: SIZES.base,
  },
  productTitle: {
    ...FONTS.h3,
    color: COLORS.charcoal,
    marginBottom: SIZES.base / 2,
  },
  productDescription: {
    ...FONTS.body3,
    color: COLORS.ash,
    lineHeight: 20,
    marginBottom: SIZES.base,
  },
  reasonText: {
    ...FONTS.body4,
    color: COLORS.cognac,
    fontStyle: 'italic',
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SIZES.padding,
  },
  favoriteButton: {
    backgroundColor: COLORS.porcelain,
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.base,
    borderRadius: SIZES.radius * 2.5,
    borderWidth: 1,
    borderColor: COLORS.cloud,
  },
  favoriteButtonText: {
    color: COLORS.charcoal,
    ...FONTS.body3,
    fontWeight: '500',
  },
  detailButton: {
    backgroundColor: COLORS.cognac,
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.base,
    borderRadius: SIZES.radius * 2.5,
  },
  detailButtonText: {
    color: COLORS.white,
    ...FONTS.body3,
    fontWeight: '600',
  },
  tipCard: {
    backgroundColor: COLORS.ivory,
    margin: SIZES.padding,
    padding: SIZES.padding,
    borderRadius: SIZES.radius * 1.5,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.gold,
  },
  tipTitle: {
    ...FONTS.h4,
    fontWeight: '600',
    color: COLORS.charcoal,
    marginBottom: SIZES.base / 2,
  },
  tipText: {
    ...FONTS.body3,
    color: COLORS.slate,
    lineHeight: 20,
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

export default vitrinimStyles;